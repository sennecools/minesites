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

  const server = await db.website.findUnique({
    where: { subdomain },
    include: {
      sections: {
        // Show all sections in preview mode; only visible ones on the live site
        where: isPreviewMode ? undefined : { visible: true },
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
    serverIp: null as string | null,
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
