import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { updateWebsiteFullSchema } from "@/lib/validations/website";
import { getPlanLimits } from "@/lib/plan";
import { apiErrorResponse } from "@/lib/api-error";
import { requireUser } from "@/lib/api-auth";

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
    // WR-01: route through the shared error helper so Zod/Prisma errors get
    // proper 400/404/409 responses instead of collapsing to a generic 500.
    return apiErrorResponse(error, {
      fallback: "Failed to load website",
      context: "GET /api/websites/[websiteId]",
    });
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
    // WR-02 / D-20: write path — require session + present User row.
    const authCtx = await requireUser();
    if ("response" in authCtx) return authCtx.response;

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

    if (existingWebsite.userId !== authCtx.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // BL-05 / WR-06: the previous code did a non-transactional `findUnique` to
    // pre-check the subdomain, which both (a) cost a round-trip on every PUT
    // and (b) had a TOCTOU window where another request could claim the
    // subdomain between the check and the transaction. Now that BL-02 fixed
    // the P2002 catch to disambiguate by constraint target, the catch alone
    // is both correct AND race-free.

    // D-18 (CR-03) + BL-01: freemium section count enforcement. requireUser()
    // above already guaranteed the User row exists (D-20); we just need
    // user.plan now, so a second findUnique is a quick read.
    const user = await db.user.findUnique({
      where: { id: authCtx.userId },
      select: { plan: true },
    });
    // Defensive: between requireUser() and here a race could delete the User,
    // but the parent ownership check (existingWebsite.userId !== authCtx.userId)
    // would still fail on subsequent requests. Treat null as 401 for safety.
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
      const updatedResult = await db.$transaction(async (tx) => {
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

        // WR-03: re-read sections in the same tx so the response carries the
        // post-write canonical state (correct order tie-breaks, Prisma-normalized
        // values, defaults). The editor's saveServer() can then hydrate without
        // a separate GET round-trip.
        const updatedSections = await tx.section.findMany({
          where: { websiteId },
          orderBy: { order: "asc" },
        });

        return { website, sections: updatedSections };
      });

      return NextResponse.json({
        ...updatedResult.website,
        sections: updatedResult.sections,
      });
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
    // WR-01: shared helper covers ZodError, Prisma known errors, and falls
    // back to 500 with `error.message` in details. The inner try/catch
    // already handles the subdomain-specific P2002 path before rethrowing,
    // but routing the rethrown error through the helper also picks up the
    // target-specific P2002 mapping for non-subdomain unique conflicts.
    return apiErrorResponse(error, {
      fallback: "Failed to save website",
      context: "PUT /api/websites/[websiteId]",
    });
  }
}

// DELETE /api/websites/[websiteId] - Hard delete website
// Cascade handles Section + MinecraftServer rows (Phase 6 D-04, D-05).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    // WR-02 / D-20: write paths must verify the User row still exists.
    const authCtx = await requireUser();
    if ("response" in authCtx) return authCtx.response;

    const { websiteId } = await params;

    const existing = await db.website.findUnique({
      where: { id: websiteId },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    if (existing.userId !== authCtx.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.website.delete({ where: { id: websiteId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error, {
      fallback: "Failed to delete website",
      context: "DELETE /api/websites/[websiteId]",
    });
  }
}
