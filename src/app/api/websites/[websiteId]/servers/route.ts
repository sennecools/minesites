import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createMcserverSchema } from "@/lib/validations/mcserver";
import { apiErrorResponse } from "@/lib/api-error";
import { requireUser } from "@/lib/api-auth";

// POST /api/websites/[websiteId]/servers
// Create a new MinecraftServer connection linked to the parent Website.
// Returns 201 with the full record so the client can update local state.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    // WR-02 / D-20: this is a write path; require both a valid session AND a
    // present User row to avoid orphaned FK references.
    const authCtx = await requireUser();
    if ("response" in authCtx) return authCtx.response;

    const { websiteId } = await params;

    // D-05: ownership check on parent Website
    const website = await db.website.findUnique({
      where: { id: websiteId },
      select: { userId: true },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    if (website.userId !== authCtx.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = createMcserverSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, ip, port, description } = parseResult.data;

    const created = await db.minecraftServer.create({
      data: {
        name,
        ip,
        // port is omitted if undefined — Prisma applies the @default(25565) from schema
        ...(port !== undefined ? { port } : {}),
        description,
        websiteId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, {
      fallback: "Failed to create Minecraft server",
      context: "POST /api/websites/[websiteId]/servers",
    });
  }
}
