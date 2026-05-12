"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createWebsiteSchema, updateWebsiteSchema } from "@/lib/validations/website";
import { Prisma } from "@prisma/client";

export async function createWebsite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // BL-06: `description` is treated as create-time optional. Empty string → undefined
  // so Prisma applies its default (null) on create. On update (see updateWebsite)
  // empty string is mapped to `null` to allow explicit clearing.
  const descriptionRaw = formData.get("description");
  const rawData = {
    name: formData.get("name"),
    subdomain: formData.get("subdomain"),
    description:
      typeof descriptionRaw === "string" && descriptionRaw.length > 0
        ? descriptionRaw
        : undefined,
  };

  const validated = createWebsiteSchema.parse(rawData);

  const userRecord = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!userRecord) {
    throw new Error("Session expired. Please sign out and sign back in.");
  }

  // BL-05: drop the non-transactional pre-check on subdomain — the P2002 catch
  // below is the authoritative (race-free) backstop. The pre-check added a
  // round-trip without providing any safety guarantee.
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

export async function updateWebsite(serverId: string, formData: FormData) {
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

  // BL-06: distinguish "field absent" (do not change) from "field empty" (clear it).
  // FormData.has → user submitted the field at all; empty value → set to `null`.
  const nameRaw = formData.get("name");
  const subdomainRaw = formData.get("subdomain");
  const descriptionRaw = formData.get("description");
  const rawData = {
    name: typeof nameRaw === "string" && nameRaw.length > 0 ? nameRaw : undefined,
    subdomain:
      typeof subdomainRaw === "string" && subdomainRaw.length > 0
        ? subdomainRaw
        : undefined,
    // If the form submitted `description` at all, honor it: empty string → null
    // (explicit clear); non-empty string → keep. If absent, leave as undefined.
    description: formData.has("description")
      ? typeof descriptionRaw === "string" && descriptionRaw.length > 0
        ? descriptionRaw
        : null
      : undefined,
  };

  const validated = updateWebsiteSchema.parse(rawData);

  // BL-05: drop the non-transactional pre-check on subdomain — the P2002 catch
  // below covers the same case without a round-trip and without a TOCTOU window.
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

export async function deleteWebsite(serverId: string) {
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
