import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PreviewClient from "./preview-client";

interface Props {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export default async function ServerPage({ params, searchParams }: Props) {
  const { subdomain } = await params;
  const { preview } = await searchParams;
  const isPreviewMode = preview === "true";

  const server = await db.server.findUnique({
    where: { subdomain },
    include: {
      sections: {
        where: { visible: true },
        orderBy: { order: "asc" },
      },
    },
  });

  // Allow preview mode to bypass the published check
  if (!server || (!server.published && !isPreviewMode)) {
    notFound();
  }

  // Transform data for the client component
  const serverData = {
    name: server.name,
    subdomain: server.subdomain,
    serverIp: server.serverIp,
  };

  const sections = server.sections.map((section) => ({
    id: section.id,
    type: section.type,
    title: section.title,
    subtitle: section.subtitle,
    settings: section.settings as Record<string, unknown>,
    visible: section.visible,
  }));

  return (
    <PreviewClient
      server={serverData}
      sections={sections}
      isPreviewMode={isPreviewMode}
    />
  );
}
