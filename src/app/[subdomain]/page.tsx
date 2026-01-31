import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { HeroSection } from "@/components/sections/hero-section";

interface Props {
  params: Promise<{ subdomain: string }>;
}

export default async function ServerPage({ params }: Props) {
  const { subdomain } = await params;

  const server = await db.server.findUnique({
    where: { subdomain },
    include: {
      sections: {
        where: { visible: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!server || !server.published) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {server.sections.map((section) => {
        switch (section.type) {
          case "hero":
            return (
              <HeroSection
                key={section.id}
                title={section.title || server.name}
                content={section.content as Record<string, unknown>}
                serverIp={server.serverIp}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
