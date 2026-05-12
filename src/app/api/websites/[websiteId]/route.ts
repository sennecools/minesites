import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { updateWebsiteSchema } from "@/lib/validations/website";
import { getPlanLimits } from "@/lib/plan";

// GET /api/websites/[websiteId] - Load website with sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;

    const website = await db.website.findUnique({
      where: { id: websiteId },
      include: {
        sections: { orderBy: { order: "asc" } },
        servers: true,
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    if (website.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(website);
  } catch (error) {
    console.error("Error loading website:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to load website", details: message }, { status: 500 });
  }
}

// PUT /api/websites/[websiteId] - Update website + sections
// Carry-forward guards (do NOT regress):
//   D-17 / CR-01: updateWebsiteSchema validation + subdomain 409 conflict check
//   D-18 / CR-03: freemium section count limit from getPlanLimits('free').maxSections
//   D-19 / WR-05: P2002 catch on subdomain unique constraint
//   D-21: section.settings is canonical home; minecraftServerId persists unchanged inside settings JSON
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;
    const body = await request.json();
    const { logo, banner, navbar, theme, sections } = body;

    // D-17 (CR-01): Validate name/subdomain/description fields
    const parseResult = updateWebsiteSchema.safeParse({
      name: body.name,
      subdomain: body.subdomain,
      description: body.description,
    });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const { name, subdomain, description } = parseResult.data;

    // Ownership check (D-05 pattern from CONTEXT)
    const existingWebsite = await db.website.findUnique({
      where: { id: websiteId },
      select: { userId: true, subdomain: true },
    });

    if (!existingWebsite) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    if (existingWebsite.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // D-17 (CR-01): subdomain uniqueness check when subdomain is changing
    if (subdomain && subdomain !== existingWebsite.subdomain) {
      const conflict = await db.website.findUnique({ where: { subdomain } });
      if (conflict) {
        return NextResponse.json({ error: "Subdomain is already taken" }, { status: 409 });
      }
    }

    // D-18 (CR-03): freemium section count enforcement, sourced from src/lib/plan.ts.
    // BL-01: explicit null-check on the user lookup. Without it, a stale session
    // (D-20: User row deleted after session issuance) silently falls through the
    // optional-chain guard `user?.plan !== "pro"` (both inequality checks evaluate
    // to `true` when `user` is null), entering the limit block but then continuing
    // the request even though the FK is gone. The PUT must reject 401 here just
    // like POST does — D-20 is enforced asymmetrically otherwise.
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Session expired. Please sign out and sign back in." },
        { status: 401 }
      );
    }
    if (sections && Array.isArray(sections) && user.plan !== "pro" && user.plan !== "paid") {
      const freeLimit = getPlanLimits("free").maxSections;
      if (sections.length > freeLimit) {
        return NextResponse.json(
          { error: `Free plan is limited to ${freeLimit} sections` },
          { status: 403 }
        );
      }
    }

    // Transactional update — sections are bulk-replaced (delete + createMany).
    // D-21: section.settings is canonical home; minecraftServerId is a top-level key
    // INSIDE settings JSON, persisted as-is without special handling.
    try {
      const updatedWebsite = await db.$transaction(async (tx) => {
        const website = await tx.website.update({
          where: { id: websiteId },
          data: { name, subdomain, description, logo, banner, navbar, theme },
        });

        if (sections && Array.isArray(sections)) {
          await tx.section.deleteMany({ where: { websiteId } });

          await tx.section.createMany({
            data: sections.map((section: {
              id: string;
              type: string;
              title?: string;
              subtitle?: string;
              settings?: Record<string, unknown>;
              visible?: boolean;
            }, index: number) => ({
              id: section.id,
              type: section.type,
              title: section.title || null,
              subtitle: section.subtitle || null,
              // D-10 / D-21: settings is passed through unchanged so any top-level
              // key (including minecraftServerId) is persisted as-is.
              settings: (section.settings || {}) as Prisma.InputJsonValue,
              order: index,
              visible: section.visible ?? true,
              websiteId,
            })),
          });
        }

        return website;
      });

      return NextResponse.json(updatedWebsite);
    } catch (error) {
      // D-19 (WR-05): P2002 catch covers TOCTOU race on subdomain unique constraint
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ error: "Subdomain is already taken" }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error saving website:", error);
    return NextResponse.json({ error: "Failed to save website" }, { status: 500 });
  }
}

// DELETE /api/websites/[websiteId] - Hard delete website
// Cascade handles Section + MinecraftServer rows (Phase 6 D-04, D-05).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId } = await params;

    const existing = await db.website.findUnique({
      where: { id: websiteId },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.website.delete({ where: { id: websiteId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting website:", error);
    return NextResponse.json({ error: "Failed to delete website" }, { status: 500 });
  }
}
