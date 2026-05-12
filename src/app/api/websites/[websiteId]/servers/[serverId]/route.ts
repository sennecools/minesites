import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateMcserverSchema } from "@/lib/validations/mcserver";
import { apiErrorResponse } from "@/lib/api-error";

// PUT /api/websites/[websiteId]/servers/[serverId]
// Update a MinecraftServer connection. Body is a partial of the create shape.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ websiteId: string; serverId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId, serverId } = await params;

    // D-05: parent Website ownership check
    const website = await db.website.findUnique({
      where: { id: websiteId },
      select: { userId: true },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    if (website.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the MinecraftServer exists AND belongs to this Website.
    // Prevents cross-website edits even if the user is authenticated.
    const existing = await db.minecraftServer.findUnique({
      where: { id: serverId },
      select: { id: true, websiteId: true },
    });

    if (!existing || existing.websiteId !== websiteId) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const body = await request.json();
    const parseResult = updateMcserverSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await db.minecraftServer.update({
      where: { id: serverId },
      data: parseResult.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return apiErrorResponse(error, {
      fallback: "Failed to update Minecraft server",
      context: "PUT /api/websites/[websiteId]/servers/[serverId]",
    });
  }
}

// DELETE /api/websites/[websiteId]/servers/[serverId]
// Remove a MinecraftServer connection. Soft references in section.settings are left
// dangling (D-12) — renderer phase handles "No server selected" placeholder.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ websiteId: string; serverId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteId, serverId } = await params;

    // D-05: parent Website ownership check
    const website = await db.website.findUnique({
      where: { id: websiteId },
      select: { userId: true },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    if (website.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the MinecraftServer exists AND belongs to this Website.
    const existing = await db.minecraftServer.findUnique({
      where: { id: serverId },
      select: { id: true, websiteId: true },
    });

    if (!existing || existing.websiteId !== websiteId) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    await db.minecraftServer.delete({ where: { id: serverId } });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error, {
      fallback: "Failed to delete Minecraft server",
      context: "DELETE /api/websites/[websiteId]/servers/[serverId]",
    });
  }
}
