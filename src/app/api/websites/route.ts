import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { createWebsiteSchema } from "@/lib/validations/website";

// GET /api/websites - List all websites for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const websites = await db.website.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        subdomain: true,
        description: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(websites);
  } catch (error) {
    console.error("Error loading websites:", error);
    return NextResponse.json({ error: "Failed to load websites" }, { status: 500 });
  }
}

// POST /api/websites - Create a new website for the current user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // D-20: session user existence check
    const userRecord = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (!userRecord) {
      return NextResponse.json(
        { error: "Session expired. Please sign out and sign back in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = createWebsiteSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const { name, subdomain, description } = parseResult.data;

    try {
      const website = await db.website.create({
        data: {
          name,
          subdomain,
          description,
          userId: session.user.id,
          sections: {
            create: {
              type: "hero",
              title: name,
              subtitle: "Welcome to our Minecraft server!",
              settings: {},
              order: 0,
            },
          },
        },
      });
      return NextResponse.json(website, { status: 201 });
    } catch (error) {
      // D-19 + BL-02: target-specific P2002 mapping. The POST path only has a
      // subdomain unique constraint right now, but disambiguating future
      // constraints up-front keeps the error contract honest.
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
    console.error("Error creating website:", error);
    return NextResponse.json({ error: "Failed to create website" }, { status: 500 });
  }
}
