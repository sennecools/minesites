"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createServerSchema, updateServerSchema } from "@/lib/validations/server";

export async function createServer(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const portStr = formData.get("serverPort");
  const rawData = {
    name: formData.get("name"),
    subdomain: formData.get("subdomain"),
    description: formData.get("description") || undefined,
    serverIp: formData.get("serverIp") || undefined,
    serverPort: portStr ? parseInt(portStr as string, 10) : undefined,
  };

  const validated = createServerSchema.parse(rawData);

  const existing = await db.server.findUnique({
    where: { subdomain: validated.subdomain },
  });

  if (existing) {
    throw new Error("Subdomain is already taken");
  }

  const server = await db.server.create({
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

  revalidatePath("/dashboard");
  redirect(`/dashboard/${server.id}`);
}

export async function updateServer(serverId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const server = await db.server.findFirst({
    where: { id: serverId, userId: session.user.id },
  });

  if (!server) {
    throw new Error("Server not found");
  }

  const portStr = formData.get("serverPort");
  const rawData = {
    name: formData.get("name") || undefined,
    subdomain: formData.get("subdomain") || undefined,
    description: formData.get("description") || undefined,
    serverIp: formData.get("serverIp") || undefined,
    serverPort: portStr ? parseInt(portStr as string, 10) : undefined,
  };

  const validated = updateServerSchema.parse(rawData);

  if (validated.subdomain && validated.subdomain !== server.subdomain) {
    const existing = await db.server.findUnique({
      where: { subdomain: validated.subdomain },
    });
    if (existing) {
      throw new Error("Subdomain is already taken");
    }
  }

  await db.server.update({
    where: { id: serverId },
    data: validated,
  });

  revalidatePath(`/dashboard/${serverId}`);
  revalidatePath("/dashboard");
}

export async function deleteServer(serverId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const server = await db.server.findFirst({
    where: { id: serverId, userId: session.user.id },
  });

  if (!server) {
    throw new Error("Server not found");
  }

  await db.server.delete({
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

  const server = await db.server.findFirst({
    where: { id: serverId, userId: session.user.id },
  });

  if (!server) {
    throw new Error("Server not found");
  }

  await db.server.update({
    where: { id: serverId },
    data: { published: !server.published },
  });

  revalidatePath(`/dashboard/${serverId}`);
  revalidatePath("/dashboard");
}
