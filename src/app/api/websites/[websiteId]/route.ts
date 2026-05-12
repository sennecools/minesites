import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { updateWebsiteFullSchema } from "@/lib/validations/website";
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

    // D-17 (CR-01) + BL-03 + BL-04: validate the full PUT body in a single pass.
    // updateWebsiteFullSchema covers name/subdomain/description (carry-forward)
    // plus logo/banner URL schemes (BL-03), navbar/theme strict shapes (BL-03),
    // and the sections array shape + duplicate-id check (BL-04, WR-05).
    const parseResult = updateWebsiteFullSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const {
      name,
      subdomain,
      description,
      logo,
      banner,
      navbar,
      theme,
      sections,
    } = parseResult.data;

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

    // BL-05 / WR-06: the previous code did a non-transactional `findUnique` to
    // pre-check the subdomain, which both (a) cost a round-trip on every PUT
    // and (b) had a TOCTOU window where another request could claim the
    // subdomain between the check and the transaction. Now that BL-02 fixed
    // the P2002 catch to disambiguate by constraint target, the catch alone
    // is both correct AND race-free.

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

        if (sections) {
          await tx.section.deleteMany({ where: { websiteId } });

          await tx.section.createMany({
            data: sections.map((section, index) => ({
              id: section.id,
              type: section.type,
              title: section.title || null,
              subtitle: section.subtitle || null,
              // D-10 / D-21: settings is passed through unchanged so any top-level
              // key (including minecraftServerId) is persisted as-is. The Zod
              // schema (sectionSchema in validations/website.ts) only enforces
              // the outer envelope; per-type field shapes are documented in
              // src/types/sections.ts and applied at render time.
              settings: (section.settings || {}) as Prisma.InputJsonValue,
              // BL-04: order is server-controlled, not trusted from the client.
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
      // D-19 (WR-05) + BL-02: P2002 catch covers TOCTOU race on the subdomain
      // unique constraint, but the same code fires for ANY unique violation in
      // the transaction (notably Section.id collisions when the client supplies
      // duplicate or already-used section IDs). Disambiguate on `error.meta.target`
      // so non-subdomain collisions return a generic 409 with the constraint name
      // rather than a misleading "Subdomain is already taken" message.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = error.meta?.target as string[] | string | undefined;
        const targetStr = Array.isArray(target) ? target.join(",") : target ?? "";
        if (targetStr.includes("subdomain")) {
          return NextResponse.json({ error: "Subdomain is already taken" }, { status: 409 });
        }
        return NextResponse.json(
          { error: "Conflict on unique constraint", details: targetStr || "unknown" },
          { status: 409 }
        );
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
