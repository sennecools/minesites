import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  // Find the user
  const user = await db.user.findUnique({
    where: { email: "sennecools1009@gmail.com" },
  });

  if (!user) {
    console.log("User not found. Creating a placeholder...");
    // We'll need to create via the actual auth flow
    console.log("Please sign in first to create your account.");
    await pool.end();
    return;
  }

  console.log("Found user:", user.id, user.email);

  // Check if server already exists
  const existingServer = await db.server.findFirst({
    where: { userId: user.id },
  });

  if (existingServer) {
    console.log("Server already exists:", existingServer.id, existingServer.subdomain);
    await pool.end();
    return;
  }

  // Create a new server with sections
  const server = await db.server.create({
    data: {
      name: "EpicCraft Network",
      subdomain: "epiccraft",
      description: "The best survival and skyblock experience",
      serverIp: "play.epiccraft.net",
      serverPort: 25565,
      published: false,
      userId: user.id,
      navbar: {
        links: [
          { label: "Home", href: "/" },
          { label: "Servers", href: "/servers" },
          { label: "Store", href: "/store" },
          { label: "Discord", href: "/discord" },
        ],
        showLogo: true,
        style: "default",
      },
      sections: {
        create: [
          {
            id: "hero-1",
            type: "hero",
            title: "EpicCraft Network",
            subtitle: "A community-driven Minecraft network for modded exploration and creativity.",
            order: 0,
            visible: true,
            settings: {
              hero: {
                alignment: "center",
                backgroundType: "gradient",
                gradientFrom: "#f0f9ff",
                gradientTo: "#ecfdf5",
                playerBadge: "top",
                badgeStyle: "pill",
              },
            },
          },
          {
            id: "stats-1",
            type: "stats",
            title: "Server Statistics",
            order: 1,
            visible: true,
            settings: {
              stats: {
                mode: "single",
                layout: "grid",
                showVersion: true,
                showUptime: true,
                version: "1.20.4",
                uptime: "99.9%",
                backgroundType: "solid",
                backgroundColor: "#18181b",
              },
            },
          },
          {
            id: "features-1",
            type: "features",
            title: "Why Join Us?",
            subtitle: "Experience the best Minecraft has to offer",
            order: 2,
            visible: true,
            settings: {
              features: {
                layout: "2x2",
                headerAlignment: "center",
                cardAlignment: "left",
                backgroundType: "gradient",
                gradientFrom: "#ffffff",
                gradientTo: "#f4f4f5",
              },
              content: {
                features: [
                  { title: "Fast Performance", description: "Optimized servers with minimal lag", icon: "zap" },
                  { title: "Anti-Cheat", description: "Advanced anti-cheat protection", icon: "shield" },
                  { title: "Active Community", description: "Join our Discord community", icon: "users" },
                  { title: "24/7 Uptime", description: "Always online servers", icon: "star" },
                ],
              },
            },
          },
          {
            id: "gamemodes-1",
            type: "gamemodes",
            title: "Active Servers",
            subtitle: "Choose your adventure",
            order: 3,
            visible: true,
            settings: {
              gamemodes: {
                layout: "grid-2x2",
                cardStyle: "default",
                alignment: "left",
                backgroundType: "solid",
                backgroundColor: "#fafafa",
                showPlayerCount: true,
                showModpack: true,
                showDescription: true,
                showBadge: true,
                showViewAllButton: true,
              },
              content: {
                modes: ["Survival", "Skyblock", "Prison", "Creative"],
              },
            },
          },
          {
            id: "discord-1",
            type: "discord",
            title: "Join Our Discord",
            subtitle: "Connect with our community",
            order: 4,
            visible: true,
            settings: {
              discord: {
                layout: "default",
                alignment: "left",
                backgroundType: "gradient",
                gradientFrom: "#eef2ff",
                gradientTo: "#faf5ff",
                showBadge: true,
                showStats: true,
                buttonText: "Join Server",
              },
            },
          },
          {
            id: "gallery-1",
            type: "gallery",
            title: "Screenshots",
            subtitle: "Take a look at our amazing builds",
            order: 5,
            visible: true,
            settings: {
              gallery: {
                layout: "bento",
                showLabels: true,
                backgroundType: "solid",
                backgroundColor: "#ffffff",
              },
            },
          },
        ],
      },
    },
  });

  console.log("Created server:", server.id, server.subdomain);
  await pool.end();
}

main().catch(console.error);
