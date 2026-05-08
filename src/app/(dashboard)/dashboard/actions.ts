"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createWebsiteSchema, updateWebsiteSchema } from "@/lib/validations/website";
import { Prisma } from "@prisma/client";

export async function createServer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const rawData = {
    name: formData.get("name"),
    subdomain: formData.get("subdomain"),
    description: formData.get("description") || undefined,
  };

  const validated = createWebsiteSchema.parse(rawData);

  const existing = await db.website.findUnique({
    where: { subdomain: validated.subdomain },
  });

  if (existing) {
    throw new Error("Subdomain is already taken");
  }

  let server;
  try {
    server = await db.website.create({
      data: {
        ...validated,
        userId: session.user.id,
        sections: {
          create: {
            type: "hero",
            title: validated.name,
            subtitle: "Welcome to our Minecraft server!",
            settings: {},
            order: 0,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Subdomain is already taken");
    }
    throw error;
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${server.id}`);
}

export async function updateServer(serverId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const server = await db.website.findFirst({
    where: { id: serverId, userId: session.user.id },
  });

  if (!server) {
    throw new Error("Server not found");
  }

  const rawData = {
    name: formData.get("name") || undefined,
    subdomain: formData.get("subdomain") || undefined,
    description: formData.get("description") || undefined,
  };

  const validated = updateWebsiteSchema.parse(rawData);

  if (validated.subdomain && validated.subdomain !== server.subdomain) {
    const existing = await db.website.findUnique({
      where: { subdomain: validated.subdomain },
    });
    if (existing) {
      throw new Error("Subdomain is already taken");
    }
  }

  try {
    await db.website.update({
      where: { id: serverId },
      data: validated,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Subdomain is already taken");
    }
    throw error;
  }

  revalidatePath(`/dashboard/${serverId}`);
  revalidatePath("/dashboard");
}

export async function deleteServer(serverId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const server = await db.website.findFirst({
    where: { id: serverId, userId: session.user.id },
  });

  if (!server) {
    throw new Error("Server not found");
  }

  await db.website.delete({
    where: { id: serverId },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function togglePublished(serverId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const server = await db.website.findFirst({
    where: { id: serverId, userId: session.user.id },
  });

  if (!server) {
    throw new Error("Server not found");
  }

  await db.website.update({
    where: { id: serverId },
    data: { published: !server.published },
  });

  revalidatePath(`/dashboard/${serverId}`);
  revalidatePath("/dashboard");
}
