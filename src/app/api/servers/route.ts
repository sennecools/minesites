import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/servers - List all servers for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const servers = await db.server.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        subdomain: true,
        description: true,
        serverIp: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(servers);
  } catch (error) {
    console.error("Error loading servers:", error);
    return NextResponse.json({ error: "Failed to load servers" }, { status: 500 });
  }
}
