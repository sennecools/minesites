import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { updateWebsiteSchema } from "@/lib/validations/website";

// GET /api/servers/[serverId] - Load server data with sections
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serverId } = await params;

    const website = await db.website.findUnique({
      where: { id: serverId },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Check ownership
    if (website.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(website);
  } catch (error) {
    console.error("Error loading server:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to load server", details: message }, { status: 500 });
  }
}

// PUT /api/servers/[serverId] - Save server data with sections
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serverId } = await params;
    const body = await request.json();
    const { logo, banner, navbar, theme, sections } = body;

    // Validate name/subdomain/description fields
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

    // Check ownership
    const existingWebsite = await db.website.findUnique({
      where: { id: serverId },
      select: { userId: true, subdomain: true },
    });

    if (!existingWebsite) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    if (existingWebsite.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If subdomain is changing, verify it is not taken
    if (subdomain && subdomain !== existingWebsite.subdomain) {
      const conflict = await db.website.findUnique({ where: { subdomain } });
      if (conflict) {
        return NextResponse.json({ error: "Subdomain is already taken" }, { status: 409 });
      }
    }

    // Freemium enforcement: validate section count against user.plan
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const FREE_SECTION_LIMIT = 5;
    if (sections && Array.isArray(sections) && user?.plan !== "pro") {
      if (sections.length > FREE_SECTION_LIMIT) {
        return NextResponse.json(
          { error: `Free plan is limited to ${FREE_SECTION_LIMIT} sections` },
          { status: 403 }
        );
      }
    }

    // Update website and sections in a transaction
    const updatedWebsite = await db.$transaction(async (tx) => {
      // Update website
      const website = await tx.website.update({
        where: { id: serverId },
        data: {
          name,
          subdomain,
          description,
          logo,
          banner,
          navbar,
          theme,
        },
      });

      // Delete existing sections and recreate them
      if (sections && Array.isArray(sections)) {
        await tx.section.deleteMany({
          where: { websiteId: serverId },
        });

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
            settings: (section.settings || {}) as Prisma.InputJsonValue,
            order: index,
            visible: section.visible ?? true,
            websiteId: serverId,
          })),
        });
      }

      return website;
    });

    return NextResponse.json(updatedWebsite);
  } catch (error) {
    console.error("Error saving server:", error);
    return NextResponse.json({ error: "Failed to save server" }, { status: 500 });
  }
}
