import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

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

    const server = await db.server.findUnique({
      where: { id: serverId },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Check ownership
    if (server.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(server);
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
    const { name, subdomain, description, serverIp, serverPort, logo, banner, navbar, theme, sections } = body;

    // Check ownership
    const existingServer = await db.server.findUnique({
      where: { id: serverId },
      select: { userId: true },
    });

    if (!existingServer) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    if (existingServer.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update server and sections in a transaction
    const updatedServer = await db.$transaction(async (tx) => {
      // Update server
      const server = await tx.server.update({
        where: { id: serverId },
        data: {
          name,
          subdomain,
          description,
          serverIp,
          serverPort,
          logo,
          banner,
          navbar,
          theme,
        },
      });

      // Delete existing sections and recreate them
      if (sections && Array.isArray(sections)) {
        await tx.section.deleteMany({
          where: { serverId },
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
            serverId,
          })),
        });
      }

      return server;
    });

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.error("Error saving server:", error);
    return NextResponse.json({ error: "Failed to save server" }, { status: 500 });
  }
}
