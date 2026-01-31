"use client";

import Link from "next/link";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ExternalLink,
  Save,
  Eye,
  EyeOff,
  Layout,
  Image,
  Users,
  BarChart3,
  Copy,
  Check,
  GripVertical,
  Plus,
  Trash2,
  Monitor,
  Smartphone,
  Tablet,
  X,
  Sparkles,
  MessageCircle,
  Zap,
  Shield,
  Star,
  Trophy,
  Scroll,
  Crown,
  ShoppingBag,
  HelpCircle,
  Play,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Grid3X3,
  Rows3,
  ChevronDown,
  ChevronRight,
  Undo2,
  Redo2,
  Layers,
  Server
} from "lucide-react";
import { useState } from "react";

// Mock server data
const mockServer = {
  id: "1",
  name: "EpicCraft Network",
  subdomain: "epiccraft",
  description: "The best survival and skyblock experience",
  serverIp: "play.epiccraft.net",
  published: true,
  players: 247,
  maxPlayers: 500,
  version: "1.20.4",
};

type SectionSettings = {
  alignment?: "left" | "center" | "right";
  layout?: "grid" | "list" | "cards";
  colorScheme?: "default" | "dark" | "accent";
  showBackground?: boolean;
  content?: Record<string, string | string[]>;
};

type Section = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  visible: boolean;
  settings: SectionSettings;
};

const initialSections: Section[] = [
  {
    id: "1",
    type: "hero",
    title: mockServer.name,
    subtitle: "A community-driven Minecraft network for modded exploration and creativity.",
    visible: true,
    settings: { alignment: "center", colorScheme: "default" }
  },
  {
    id: "2",
    type: "gamemodes",
    title: "Active Servers",
    visible: true,
    settings: {
      layout: "grid",
      colorScheme: "default",
      content: {
        modes: ["All the Mods 10", "MoniFactory", "Custom Pack", "Vanilla+"]
      }
    }
  },
  {
    id: "3",
    type: "features",
    title: "Why Join Us?",
    visible: true,
    settings: {
      layout: "cards",
      colorScheme: "default",
      content: {
        features: ["Fast Performance", "Anti-Cheat Protection", "Active Community", "24/7 Uptime"]
      }
    }
  },
  {
    id: "4",
    type: "discord",
    title: "Join Our Discord",
    visible: true,
    settings: { colorScheme: "default" }
  },
  {
    id: "5",
    type: "stats",
    title: "Server Statistics",
    visible: false,
    settings: { layout: "grid", colorScheme: "default" }
  },
  {
    id: "6",
    type: "gallery",
    title: "Screenshots",
    visible: false,
    settings: { layout: "grid", colorScheme: "default" }
  },
];

const sectionTypeConfig: Record<string, {
  icon: React.ElementType;
  label: string;
  category: string;
  description: string;
  locked?: boolean;
}> = {
  navbar: { icon: Layout, label: "Navigation", category: "Layout", description: "Site navigation bar", locked: true },
  hero: { icon: Layout, label: "Hero Section", category: "Essential", description: "Main banner with title and CTA" },
  stats: { icon: BarChart3, label: "Server Stats", category: "Essential", description: "Live player count and info" },
  features: { icon: Zap, label: "Features", category: "Essential", description: "Highlight server features" },
  gamemodes: { icon: Grid3X3, label: "Game Modes", category: "Essential", description: "Showcase your game modes" },
  discord: { icon: MessageCircle, label: "Discord", category: "Community", description: "Discord widget and invite" },
  gallery: { icon: Image, label: "Gallery", category: "Media", description: "Screenshot showcase" },
  video: { icon: Play, label: "Video/Trailer", category: "Media", description: "YouTube trailer embed" },
  staff: { icon: Crown, label: "Staff Team", category: "Community", description: "Show your team members" },
  rules: { icon: Scroll, label: "Server Rules", category: "Info", description: "List your server rules" },
  voting: { icon: Trophy, label: "Vote Rewards", category: "Engagement", description: "Voting sites and rewards" },
  store: { icon: ShoppingBag, label: "Store Preview", category: "Engagement", description: "Featured store items" },
  reviews: { icon: Star, label: "Reviews", category: "Community", description: "Player testimonials" },
  faq: { icon: HelpCircle, label: "FAQ", category: "Info", description: "Common questions" },
};

const sectionCategories = ["Essential", "Community", "Media", "Info", "Engagement"];

// Preview Components - Actual website sections with real styling
function PreviewHero({ section }: { section: Section }) {
  const { alignment = "center", colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  return (
    <div className={`relative overflow-hidden ${isDark ? "bg-zinc-900" : "bg-gradient-to-b from-zinc-50 to-white"}`}>
      {/* Background decoration */}
      {!isDark && (
        <>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-40" />
        </>
      )}
      {isDark && (
        <>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-900/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl" />
        </>
      )}

      <div className={`relative py-16 px-6 ${alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"}`}>
        <div className="max-w-2xl mx-auto">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 ${
            isDark ? "bg-zinc-800 text-zinc-300 border border-zinc-700" : "bg-white text-zinc-600 shadow-sm border border-zinc-200"
          }`}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {mockServer.players} players online
          </div>

          <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title}
          </h1>

          <p className={`text-lg max-w-xl mb-8 ${alignment === "center" ? "mx-auto" : ""} ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            {section.subtitle}
          </p>

          <div className={`flex gap-3 ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : ""}`}>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all">
              Join Discord
            </button>
            <button className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isDark
                ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                : "bg-white hover:bg-zinc-50 text-zinc-700 shadow-sm border border-zinc-200"
            }`}>
              Copy Server IP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStats({ section }: { section: Section }) {
  const { layout = "grid", colorScheme = "dark" } = section.settings;
  const isDark = colorScheme === "dark";

  const stats = [
    { value: mockServer.players.toString(), label: "Players Online", icon: Users, color: "text-green-500", iconBg: "bg-green-500/10" },
    { value: mockServer.maxPlayers.toString(), label: "Server Capacity", icon: Server, color: isDark ? "text-cyan-400" : "text-cyan-600", iconBg: "bg-cyan-500/10" },
    { value: mockServer.version, label: "Minecraft Version", icon: Zap, color: isDark ? "text-amber-400" : "text-amber-600", iconBg: "bg-amber-500/10" },
    { value: "99.9%", label: "Uptime", icon: BarChart3, color: isDark ? "text-indigo-400" : "text-indigo-600", iconBg: "bg-indigo-500/10" },
  ];

  return (
    <div className={`py-10 px-6 ${isDark ? "bg-zinc-900" : "bg-white border-y border-zinc-100"}`}>
      <div className={`max-w-4xl mx-auto ${layout === "list" ? "space-y-3" : "grid grid-cols-4 gap-4"}`}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${
              layout === "list"
                ? "flex items-center justify-between px-5 py-4"
                : "text-center py-5 px-4"
            } rounded-xl transition-all ${
              isDark
                ? "bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700"
                : "bg-zinc-50 border border-zinc-100 hover:border-zinc-200 hover:shadow-sm"
            }`}
          >
            {layout === "list" ? (
              <>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{stat.label}</span>
                </div>
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
              </>
            ) : (
              <>
                <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className={`text-xs mt-1 font-medium ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{stat.label}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewFeatures({ section }: { section: Section }) {
  const features = section.settings.content?.features as string[] || ["Fast Performance", "Anti-Cheat", "Active Community", "24/7 Uptime"];
  const { colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  const featureData = [
    { icon: Zap, desc: "Optimized servers with minimal lag for the best gameplay", gradient: "from-amber-500 to-orange-600" },
    { icon: Shield, desc: "Advanced anti-cheat keeping the game fair for everyone", gradient: "from-emerald-500 to-teal-600" },
    { icon: Users, desc: "Active Discord community with events and giveaways", gradient: "from-indigo-500 to-purple-600" },
    { icon: Star, desc: "99.9% uptime with 24/7 monitoring and support", gradient: "from-cyan-500 to-blue-600" },
  ];

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-gradient-to-b from-white to-zinc-50"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title}
          </h2>
          <p className={`text-base max-w-2xl mx-auto ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Everything you need for the perfect Minecraft experience
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {features.slice(0, 4).map((feature, i) => {
            const data = featureData[i] || featureData[0];
            const Icon = data.icon;
            return (
              <div
                key={i}
                className={`group p-5 rounded-2xl transition-all hover:-translate-y-1 ${
                  isDark
                    ? "bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
                    : "bg-white border border-zinc-200 shadow-sm hover:shadow-lg hover:border-zinc-300"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${data.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {feature}
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                  {data.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewGamemodes({ section }: { section: Section }) {
  const modes = section.settings.content?.modes as string[] || ["Survival", "Skyblock", "Prison", "KitPvP"];
  const { colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  const serverData = [
    { modpack: "ATM10", desc: "Endless tech, magic, and chaos.", players: 4, isPopular: true, bannerGradient: "from-emerald-400 via-cyan-500 to-blue-600", bannerPattern: true },
    { modpack: "MoniFactory v1.3", desc: "Factory-focused modpack with tight progression.", players: 0, isClosed: true, bannerGradient: "from-violet-500 via-purple-500 to-fuchsia-600", bannerPattern: false },
    { modpack: "Custom Pack", desc: "Our own curated modpack experience.", players: 12, bannerGradient: "from-amber-400 via-orange-500 to-red-500", bannerPattern: true },
    { modpack: "Vanilla+", desc: "Enhanced vanilla with quality of life mods.", players: 8, bannerGradient: "from-rose-400 via-pink-500 to-purple-500", bannerPattern: false },
  ];

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title}
          </h2>
          <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Choose your adventure</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {modes.slice(0, 4).map((mode, i) => {
            const data = serverData[i] || serverData[0];
            return (
              <div
                key={i}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                  isDark
                    ? "bg-zinc-800 hover:bg-zinc-750 ring-1 ring-zinc-700/50"
                    : "bg-white shadow-sm hover:shadow-xl border border-zinc-200"
                }`}
              >
                {/* Banner with gradient and optional pattern */}
                <div className={`relative aspect-[3/1] bg-gradient-to-br ${data.bannerGradient}`}>
                  {data.bannerPattern && (
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '10px 10px'
                    }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  {/* Status badge */}
                  {data.isPopular && (
                    <span className="absolute top-3 right-3 text-xs font-bold bg-indigo-600 text-white px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Popular
                    </span>
                  )}
                  {data.isClosed && (
                    <span className="absolute top-3 right-3 text-xs font-bold bg-red-600 text-white px-2.5 py-1 rounded-lg shadow-lg">
                      Closed
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className={`text-lg font-bold group-hover:text-indigo-600 transition-colors ${isDark ? "text-white" : "text-zinc-900"}`}>
                        {mode}
                      </h3>
                      <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{data.modpack}</p>
                    </div>
                  </div>

                  <p className={`text-sm mb-4 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    {data.desc}
                  </p>

                  {/* Status bar */}
                  <div className={`flex items-center justify-between pt-3 border-t ${isDark ? "border-zinc-700" : "border-zinc-100"}`}>
                    {data.isClosed ? (
                      <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Server closed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        {data.players} online
                      </span>
                    )}
                    <ChevronRight className={`w-5 h-5 ${isDark ? "text-zinc-600" : "text-zinc-400"} group-hover:text-indigo-500 group-hover:translate-x-1 transition-all`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isDark
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
              : "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 shadow-sm"
          }`}>
            View all servers
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewDiscord({ section }: { section: Section }) {
  const { colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-gradient-to-br from-indigo-50 via-white to-purple-50"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Text content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-4">
              <MessageCircle className="w-3.5 h-3.5" />
              Community
            </div>
            <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
              {section.title}
            </h2>
            <p className={`text-base mb-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Connect with thousands of players, get support, and stay updated on server news.
            </p>
            <div className="flex items-center gap-6 justify-center md:justify-start">
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>5.6k+</div>
                <div className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Members</div>
              </div>
              <div className={`w-px h-10 ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">1.2k</div>
                <div className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Online</div>
              </div>
            </div>
          </div>

          {/* Discord card */}
          <div className={`w-full md:w-80 rounded-2xl overflow-hidden shadow-2xl ${isDark ? "bg-[#2b2d31]" : "bg-[#2b2d31]"}`}>
            {/* Header */}
            <div className="relative h-20 bg-gradient-to-br from-indigo-500 to-purple-600">
              <div className="absolute -bottom-6 left-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 border-4 border-[#2b2d31] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
              </div>
            </div>

            <div className="pt-8 pb-4 px-4">
              <h3 className="text-white font-bold text-lg">{mockServer.name}</h3>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  1,234 Online
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-zinc-500" />
                  5,678 Members
                </span>
              </div>

              <button className="w-full mt-4 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-sm font-medium transition-colors">
                Join Server
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewGallery({ section }: { section: Section }) {
  const { colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  const images = [
    { bg: "from-emerald-400 via-cyan-500 to-blue-600", label: "Spawn Area", size: "large" },
    { bg: "from-violet-400 via-purple-500 to-fuchsia-600", label: "PvP Arena", size: "small" },
    { bg: "from-amber-400 via-orange-500 to-red-500", label: "Shop District", size: "small" },
    { bg: "from-rose-400 via-pink-500 to-purple-500", label: "Event Hall", size: "large" },
  ];

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title}
          </h2>
          <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Take a look at our amazing builds and locations
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative rounded-2xl bg-gradient-to-br ${img.bg} overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                i === 0 ? "col-span-2 aspect-[2/1]" : i === 3 ? "col-span-2 aspect-[2/1]" : "aspect-square"
              }`}
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.2'%3E%3Cpath d='M5 0h1L0 5V4L4 0H5zm1 5v1H5L6 5zm-6 0l.5-.5L1 5H0zm0-5h.5L0 .5V0z'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {/* Content */}
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-white font-bold text-lg drop-shadow-lg">{img.label}</h3>
                  <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view
                  </p>
                </div>
              </div>

              {/* Expand icon */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewStaff({ section }: { section: Section }) {
  const { colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  const staff = [
    { name: "xSteve_MC", role: "Owner", roleColor: "text-red-500", gradient: "from-red-500 to-orange-500", initial: "S" },
    { name: "AlexBuilder", role: "Admin", roleColor: "text-indigo-500", gradient: "from-indigo-500 to-purple-500", initial: "A" },
    { name: "ModeratorPro", role: "Moderator", roleColor: "text-emerald-500", gradient: "from-emerald-500 to-teal-500", initial: "M" },
    { name: "HelperSteve", role: "Helper", roleColor: "text-cyan-500", gradient: "from-cyan-500 to-blue-500", initial: "H" },
  ];

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Meet Our Team"}
          </h2>
          <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            The people who keep the server running smoothly
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {staff.map((s) => (
            <div
              key={s.name}
              className={`group text-center p-5 rounded-2xl transition-all hover:-translate-y-1 ${
                isDark
                  ? "bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700"
                  : "bg-white border border-zinc-200 shadow-sm hover:shadow-lg"
              }`}
            >
              {/* Avatar */}
              <div className="relative mx-auto mb-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                  <span className="text-white font-bold text-2xl">{s.initial}</span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-zinc-800" />
              </div>

              <p className={`font-bold text-base ${isDark ? "text-white" : "text-zinc-900"}`}>{s.name}</p>
              <p className={`text-sm font-semibold mt-1 ${s.roleColor}`}>{s.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewRules({ section }: { section: Section }) {
  const { colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  const rules = [
    { title: "No Griefing", desc: "Respect other players' builds and property. Destroying or modifying builds without permission will result in a ban.", icon: Shield },
    { title: "Be Respectful", desc: "Treat all players with kindness. Harassment, hate speech, or toxic behavior is not tolerated.", icon: Users },
    { title: "No Cheating", desc: "Hacked clients, x-ray, or any unfair advantage mods are strictly prohibited.", icon: Zap },
    { title: "No Spam", desc: "Keep chat clean. Excessive caps, repeated messages, or advertising is not allowed.", icon: MessageCircle },
  ];

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
            isDark ? "bg-red-500/10" : "bg-red-50"
          }`}>
            <Scroll className="w-7 h-7 text-red-500" />
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Server Rules"}
          </h2>
          <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Please follow these rules to keep our community safe and fun
          </p>
        </div>

        <div className="space-y-4">
          {rules.map((rule, i) => {
            const Icon = rule.icon;
            return (
              <div
                key={i}
                className={`flex items-start gap-4 p-5 rounded-2xl transition-all hover:scale-[1.01] ${
                  isDark
                    ? "bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-50 border border-zinc-100 hover:border-zinc-200 hover:shadow-sm"
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-red-500 to-orange-500 shadow-lg`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-zinc-900"}`}>{rule.title}</h3>
                    <Icon className={`w-4 h-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                  </div>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{rule.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewVoting({ section }: { section: Section }) {
  const { colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  const sites = [
    { name: "Planet Minecraft", votes: "2.4k", reward: "5 Diamonds", color: "from-green-500 to-emerald-600" },
    { name: "MC Server List", votes: "1.8k", reward: "Vote Key", color: "from-blue-500 to-indigo-600" },
    { name: "TopG", votes: "956", reward: "$500 In-Game", color: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/20" : "bg-gradient-to-br from-amber-50 via-white to-orange-50"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25`}>
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Vote & Earn Rewards"}
          </h2>
          <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Support the server by voting daily and earn awesome rewards!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {sites.map((site, i) => (
            <div
              key={site.name}
              className={`group relative p-5 rounded-2xl text-center transition-all hover:-translate-y-1 cursor-pointer overflow-hidden ${
                isDark
                  ? "bg-zinc-800/50 border border-zinc-800 hover:border-amber-500/50"
                  : "bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:border-amber-300"
              }`}
            >
              {/* Rank badge */}
              <div className={`absolute top-3 left-3 w-6 h-6 rounded-full bg-gradient-to-br ${site.color} flex items-center justify-center text-white text-xs font-bold shadow-lg`}>
                {i + 1}
              </div>

              <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${site.color} shadow-lg group-hover:scale-110 transition-transform`}>
                <Trophy className="w-7 h-7 text-white" />
              </div>

              <h3 className={`font-bold mb-1 ${isDark ? "text-white" : "text-zinc-900"}`}>{site.name}</h3>
              <p className={`text-sm mb-3 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>{site.votes} votes</p>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-700"
              }`}>
                <Star className="w-3 h-3" />
                {site.reward}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewStore({ section }: { section: Section }) {
  const { colorScheme = "dark" } = section.settings;
  const isDark = colorScheme === "dark";

  const ranks = [
    { name: "VIP", price: "$9.99", perks: ["2x Money Multiplier", "5 Home Locations", "Colored Chat Name", "Access to /fly"], gradient: "from-emerald-400 to-cyan-500" },
    { name: "MVP", price: "$19.99", perks: ["5x Money Multiplier", "10 Home Locations", "Custom Join Message", "Exclusive Kits", "Priority Support"], gradient: "from-indigo-500 to-purple-600", popular: true },
    { name: "Elite", price: "$29.99", perks: ["10x Money Multiplier", "Unlimited Homes", "All Previous Perks", "Beta Access", "Monthly Crate Keys"], gradient: "from-amber-400 to-orange-500" },
  ];

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-gradient-to-b from-zinc-50 to-white"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${
            isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-700"
          }`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            Store
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Upgrade Your Experience"}
          </h2>
          <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Support the server and unlock exclusive perks
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {ranks.map((rank) => (
            <div
              key={rank.name}
              className={`relative rounded-2xl overflow-hidden transition-all hover:-translate-y-1 ${
                rank.popular ? "scale-105 z-10" : ""
              }`}
            >
              {/* Popular banner */}
              {rank.popular && (
                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold text-center py-1.5">
                  MOST POPULAR
                </div>
              )}

              <div className={`h-full p-6 ${rank.popular ? "pt-10" : ""} ${
                isDark
                  ? "bg-zinc-800 border border-zinc-700"
                  : "bg-white border border-zinc-200 shadow-lg"
              } ${rank.popular ? (isDark ? "border-indigo-500" : "border-indigo-300 shadow-xl shadow-indigo-500/10") : ""} rounded-2xl`}>
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br ${rank.gradient} shadow-lg`}>
                  <Crown className="w-8 h-8 text-white" />
                </div>

                <h3 className={`font-bold text-center text-xl mb-1 ${isDark ? "text-white" : "text-zinc-900"}`}>{rank.name}</h3>
                <p className={`text-center text-3xl font-bold mb-6 bg-gradient-to-r ${rank.gradient} bg-clip-text text-transparent`}>
                  {rank.price}
                </p>

                <ul className="space-y-3 mb-6">
                  {rank.perks.map((perk, i) => (
                    <li key={i} className={`text-sm flex items-start gap-2.5 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${rank.popular ? "text-indigo-500" : "text-green-500"}`} />
                      {perk}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                  rank.popular
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30"
                    : isDark
                      ? "bg-zinc-700 text-white hover:bg-zinc-600"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}>
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewReviews({ section }: { section: Section }) {
  const { colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  const reviews = [
    { name: "CraftMaster99", text: "Best survival server I've ever played on! The community is amazing and the staff are super helpful. Been playing for 6 months now!", rating: 5, date: "2 days ago", gradient: "from-emerald-500 to-cyan-500" },
    { name: "BlockBuilder", text: "Great performance, no lag even with 200+ players. The custom plugins are really well made.", rating: 5, date: "1 week ago", gradient: "from-violet-500 to-purple-500" },
    { name: "MinecraftPro2024", text: "Love the events and the active Discord community. Staff responds within minutes!", rating: 4, date: "2 weeks ago", gradient: "from-amber-500 to-orange-500" },
  ];

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-zinc-50"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
              {section.title || "What Players Say"}
            </h2>
            <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Real reviews from our community
            </p>
          </div>

          {/* Rating summary */}
          <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl ${
            isDark ? "bg-zinc-800" : "bg-white border border-zinc-200 shadow-sm"
          }`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{avgRating}</div>
              <div className="flex gap-0.5 mt-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(Number(avgRating)) ? "text-amber-400 fill-amber-400" : "text-zinc-300"}`} />
                ))}
              </div>
            </div>
            <div className={`w-px h-10 ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`} />
            <div className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Based on <span className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>127</span> reviews
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 transition-all hover:-translate-y-1 ${
                isDark
                  ? "bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700"
                  : "bg-white border border-zinc-200 shadow-sm hover:shadow-lg"
              }`}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-300"}`} />
                ))}
              </div>

              <p className={`text-sm leading-relaxed mb-4 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                "{review.text}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${review.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-sm">{review.name[0]}</span>
                  </div>
                  <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>{review.name}</span>
                </div>
                <span className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewFaq({ section }: { section: Section }) {
  const { colorScheme = "default" } = section.settings;
  const isDark = colorScheme === "dark";

  const faqs = [
    { q: "How do I join the server?", a: "Simply add our IP address to your Minecraft server list and connect! We support both Java and Bedrock editions.", icon: Server },
    { q: "What Minecraft version is supported?", a: `We currently support ${mockServer.version} and above. We recommend using the latest version for the best experience.`, icon: Zap },
    { q: "Is the server free to play?", a: "Yes! The server is completely free to play. We offer optional ranks and cosmetics to support server costs.", icon: Star },
    { q: "How can I report a player?", a: "You can report players using /report in-game or through our Discord server. Staff will review reports within 24 hours.", icon: Shield },
  ];

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 ${
            isDark ? "bg-indigo-500/10" : "bg-indigo-50"
          }`}>
            <HelpCircle className="w-7 h-7 text-indigo-500" />
          </div>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Frequently Asked Questions"}
          </h2>
          <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Got questions? We've got answers
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const Icon = faq.icon;
            return (
              <div
                key={i}
                className={`group rounded-2xl overflow-hidden transition-all ${
                  isDark
                    ? "bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-50 border border-zinc-100 hover:border-zinc-200 hover:shadow-sm"
                }`}
              >
                <div className={`flex items-center gap-4 p-5 cursor-pointer`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isDark ? "bg-zinc-700" : "bg-white shadow-sm"
                  }`}>
                    <Icon className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-500"}`} />
                  </div>
                  <span className={`font-semibold flex-1 ${isDark ? "text-white" : "text-zinc-900"}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform group-hover:rotate-180 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                </div>
                <div className={`px-5 pb-5 pt-0`}>
                  <div className={`pl-14`}>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewVideo({ section }: { section: Section }) {
  const { colorScheme = "dark" } = section.settings;
  const isDark = colorScheme === "dark";

  return (
    <div className={`py-14 px-6 ${isDark ? "bg-zinc-900" : "bg-gradient-to-b from-zinc-50 to-white"}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Watch Our Trailer"}
          </h2>
          <p className={`${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            See what makes our server special
          </p>
        </div>

        <div className={`relative aspect-video rounded-3xl overflow-hidden group cursor-pointer shadow-2xl ${
          isDark ? "shadow-black/50" : "shadow-zinc-300/50"
        }`}>
          {/* Thumbnail background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Pulse effect */}
              <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                <Play className="w-8 h-8 text-indigo-600 fill-indigo-600 ml-1" />
              </div>
            </div>
          </div>

          {/* Video info */}
          <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between">
            <div>
              <p className="text-white font-bold text-lg mb-1">Official Server Trailer</p>
              <p className="text-white/60 text-sm">Experience the adventure</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur-sm">
              <Play className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">2:34</span>
            </div>
          </div>

          {/* YouTube-like progress bar */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
            <div className="h-full w-0 bg-red-500 group-hover:w-1/4 transition-all duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionPreview({ section }: { section: Section }) {
  switch (section.type) {
    case "hero": return <PreviewHero section={section} />;
    case "stats": return <PreviewStats section={section} />;
    case "features": return <PreviewFeatures section={section} />;
    case "gamemodes": return <PreviewGamemodes section={section} />;
    case "discord": return <PreviewDiscord section={section} />;
    case "gallery": return <PreviewGallery section={section} />;
    case "staff": return <PreviewStaff section={section} />;
    case "rules": return <PreviewRules section={section} />;
    case "voting": return <PreviewVoting section={section} />;
    case "store": return <PreviewStore section={section} />;
    case "reviews": return <PreviewReviews section={section} />;
    case "faq": return <PreviewFaq section={section} />;
    case "video": return <PreviewVideo section={section} />;
    default:
      return (
        <div className="bg-zinc-100 p-6 text-center text-zinc-500 text-sm">
          {section.type} section preview
        </div>
      );
  }
}

// Settings Panel Components
function SettingsPanel({
  section,
  onUpdate
}: {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
}) {
  const config = sectionTypeConfig[section.type];
  if (!config) return null;

  return (
    <div className="space-y-3">
      {/* Section Title */}
      <div>
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Title</label>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="mt-1 w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
        />
      </div>

      {/* Subtitle (for hero) */}
      {section.type === "hero" && (
        <div>
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Subtitle</label>
          <input
            type="text"
            value={section.subtitle || ""}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            className="mt-1 w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>
      )}

      {/* Alignment (for hero) */}
      {section.type === "hero" && (
        <div>
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Alignment</label>
          <div className="flex gap-1.5">
            {[
              { value: "left", icon: AlignLeft },
              { value: "center", icon: AlignCenter },
              { value: "right", icon: AlignRight },
            ].map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onUpdate({ settings: { ...section.settings, alignment: value as "left" | "center" | "right" } })}
                className={`flex-1 p-1.5 rounded-md border transition-all ${
                  section.settings.alignment === value
                    ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                    : "border-zinc-200 hover:border-zinc-300 text-zinc-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5 mx-auto" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Scheme */}
      {(section.type === "hero" || section.type === "discord") && (
        <div>
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Style</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { value: "default", label: "Light", colors: "bg-white border-zinc-200" },
              { value: "accent", label: "Gradient", colors: "bg-gradient-to-br from-cyan-100 to-emerald-100" },
              { value: "dark", label: "Dark", colors: "bg-zinc-800" },
            ].map(({ value, label, colors }) => (
              <button
                key={value}
                onClick={() => onUpdate({ settings: { ...section.settings, colorScheme: value as "default" | "accent" | "dark" } })}
                className={`p-1.5 rounded-md border transition-all ${
                  section.settings.colorScheme === value
                    ? "border-cyan-300 ring-1 ring-cyan-100"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className={`w-full h-4 rounded ${colors} mb-0.5`} />
                <span className="text-[10px] text-zinc-600">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Layout (for stats, features, gallery) */}
      {(section.type === "stats" || section.type === "gallery") && (
        <div>
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Layout</label>
          <div className="flex gap-1.5">
            {[
              { value: "grid", icon: Grid3X3, label: "Grid" },
              { value: "list", icon: Rows3, label: "List" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => onUpdate({ settings: { ...section.settings, layout: value as "grid" | "list" } })}
                className={`flex-1 p-1.5 rounded-md border transition-all flex flex-col items-center gap-0.5 ${
                  section.settings.layout === value
                    ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                    : "border-zinc-200 hover:border-zinc-300 text-zinc-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Editor for Features */}
      {section.type === "features" && (
        <div>
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Features</label>
          <div className="space-y-1.5">
            {((section.settings.content?.features as string[]) || []).map((feature, i) => (
              <div key={i} className="flex gap-1">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...((section.settings.content?.features as string[]) || [])];
                    newFeatures[i] = e.target.value;
                    onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, features: newFeatures } } });
                  }}
                  className="flex-1 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                <button
                  onClick={() => {
                    const newFeatures = ((section.settings.content?.features as string[]) || []).filter((_, idx) => idx !== i);
                    onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, features: newFeatures } } });
                  }}
                  className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newFeatures = [...((section.settings.content?.features as string[]) || []), "New Feature"];
                onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, features: newFeatures } } });
              }}
              className="w-full p-1.5 border border-dashed border-zinc-300 rounded-md text-[10px] text-zinc-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
            >
              + Add Feature
            </button>
          </div>
        </div>
      )}

      {/* Content Editor for Game Modes */}
      {section.type === "gamemodes" && (
        <div>
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Game Modes</label>
          <div className="space-y-1.5">
            {((section.settings.content?.modes as string[]) || []).map((mode, i) => (
              <div key={i} className="flex gap-1">
                <input
                  type="text"
                  value={mode}
                  onChange={(e) => {
                    const newModes = [...((section.settings.content?.modes as string[]) || [])];
                    newModes[i] = e.target.value;
                    onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, modes: newModes } } });
                  }}
                  className="flex-1 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
                <button
                  onClick={() => {
                    const newModes = ((section.settings.content?.modes as string[]) || []).filter((_, idx) => idx !== i);
                    onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, modes: newModes } } });
                  }}
                  className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {((section.settings.content?.modes as string[]) || []).length < 4 && (
              <button
                onClick={() => {
                  const newModes = [...((section.settings.content?.modes as string[]) || []), "New Mode"];
                  onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, modes: newModes } } });
                }}
                className="w-full p-1.5 border border-dashed border-zinc-300 rounded-md text-[10px] text-zinc-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
              >
                + Add Mode
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type NavbarSettings = {
  links: { label: string; href: string }[];
  showLogo: boolean;
  style: "default" | "centered" | "minimal";
};

const initialNavbarSettings: NavbarSettings = {
  links: [
    { label: "Home", href: "/" },
    { label: "Servers", href: "/servers" },
    { label: "Store", href: "/store" },
    { label: "Discord", href: "/discord" },
  ],
  showLogo: true,
  style: "default",
};

export default function ServerEditorPage() {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>(initialNavbarSettings);
  const [selectedSection, setSelectedSection] = useState<string | null>("1");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showAddSection, setShowAddSection] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>("Essential");

  const visibleSections = sections.filter((s) => s.visible);
  const selectedSectionData = sections.find((s) => s.id === selectedSection);

  const toggleVisibility = (id: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
    if (selectedSection === id) setSelectedSection(null);
  };

  const addSection = (type: string) => {
    const config = sectionTypeConfig[type];
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      title: config?.label || `New ${type} section`,
      visible: true,
      settings: {},
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
    setShowAddSection(false);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleCopyIP = () => {
    navigator.clipboard.writeText(mockServer.serverIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="-m-6 p-4 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-2 flex-shrink-0">
        <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-300" />
        <Link href="/dashboard/servers" className="text-zinc-400 hover:text-zinc-600 transition-colors">
          Servers
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-300" />
        <span className="text-zinc-900 font-medium">{mockServer.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-xl font-bold text-zinc-900">
                {mockServer.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="text-sm text-zinc-500">{mockServer.subdomain}.mcsite.com</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-shadow"
          >
            <Save className="w-4 h-4" />
            Publish
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex gap-0 min-h-0">
        {/* Main Editor Container */}
        <div className="flex-1 flex rounded-2xl bg-white border border-zinc-200/80 shadow-sm overflow-hidden">
          {/* Sections List */}
          <div className="w-56 flex-shrink-0 flex flex-col overflow-hidden p-3 border-r border-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 text-xs">Sections</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddSection(true)}
                className="p-1 rounded-md bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-md transition-shadow"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {/* Locked Navbar Section */}
              <div
                onClick={() => setSelectedSection("navbar")}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer transition-all mb-2 ${
                  selectedSection === "navbar"
                    ? "border-cyan-300 bg-gradient-to-r from-cyan-50 to-emerald-50"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
                }`}
              >
                <div className="text-zinc-300 flex-shrink-0 px-0.5">
                  <div className="w-3 h-3" /> {/* Spacer where grip would be */}
                </div>
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                    selectedSection === "navbar"
                      ? "bg-gradient-to-br from-cyan-500 to-emerald-500"
                      : "bg-zinc-200"
                  }`}
                >
                  <Layout className={`w-2.5 h-2.5 ${selectedSection === "navbar" ? "text-white" : "text-zinc-500"}`} />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-[11px] font-medium text-zinc-900 truncate leading-tight">Navigation</p>
                  <p className="text-[9px] text-zinc-400">Locked</p>
                </div>
              </div>

              <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-1">
                {sections.map((section) => {
                  const config = sectionTypeConfig[section.type];
                  const Icon = config?.icon || Layout;
                  const isSelected = selectedSection === section.id;

                  return (
                    <Reorder.Item key={section.id} value={section}>
                      <motion.div
                        onClick={() => setSelectedSection(isSelected ? null : section.id)}
                        title={section.title}
                        className={`group flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-cyan-300 bg-gradient-to-r from-cyan-50 to-emerald-50"
                            : "border-transparent hover:border-zinc-200 hover:bg-zinc-50"
                        } ${!section.visible ? "opacity-50" : ""}`}
                      >
                        <div className="cursor-grab text-zinc-300 hover:text-zinc-400 flex-shrink-0">
                          <GripVertical className="w-3 h-3" />
                        </div>
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-gradient-to-br from-cyan-500 to-emerald-500"
                              : section.visible
                              ? "bg-zinc-100"
                              : "bg-zinc-200"
                          }`}
                        >
                          <Icon className={`w-2.5 h-2.5 ${isSelected ? "text-white" : "text-zinc-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-[11px] font-medium text-zinc-900 truncate leading-tight">{section.title}</p>
                          <p className="text-[9px] text-zinc-400 capitalize">{section.type}</p>
                        </div>
                        <div className="flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisibility(section.id);
                            }}
                            className="p-0.5 rounded hover:bg-white transition-colors"
                          >
                            {section.visible ? (
                              <Eye className="w-2.5 h-2.5 text-zinc-400" />
                            ) : (
                              <EyeOff className="w-2.5 h-2.5 text-zinc-400" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSection(section.id);
                            }}
                            className="p-0.5 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-zinc-400 hover:text-red-500" />
                          </motion.button>
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>

              {sections.length === 0 && (
                <div className="text-center py-6 text-zinc-400 text-xs">
                  No sections yet
                </div>
              )}
            </div>

            {/* Server Info */}
            <div className="pt-2 mt-2 border-t border-zinc-100">
              <div className="flex items-center gap-1.5">
                <code className="flex-1 px-1.5 py-1 bg-zinc-50 rounded-md text-[10px] font-mono text-zinc-600 truncate">
                  {mockServer.serverIp}
                </code>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyIP}
                  className="p-1 rounded-md hover:bg-zinc-100 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-400" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Fading Divider Left */}
          <div className="relative w-px flex-shrink-0 my-4">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-200 to-transparent" />
          </div>

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-700">Preview</span>
                <span className="text-xs text-zinc-400">•</span>
                <span className="text-xs text-zinc-500">{mockServer.subdomain}.mcsite.com</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
                {[
                  { mode: "desktop" as const, icon: Monitor },
                  { mode: "tablet" as const, icon: Tablet },
                  { mode: "mobile" as const, icon: Smartphone },
                ].map(({ mode, icon: Icon }) => (
                  <motion.button
                    key={mode}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPreviewMode(mode)}
                    className={`p-1.5 rounded-md transition-all ${
                      previewMode === mode
                        ? "bg-white shadow-sm text-cyan-600"
                        : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-4 bg-[#f0f0f0] overflow-y-auto flex justify-center scrollbar-thin">
              <motion.div
                animate={{ width: previewWidth[previewMode] }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white rounded-lg shadow-xl overflow-hidden h-fit max-w-full"
              >
                {/* Navbar - clickable to edit */}
                <div
                  onClick={() => setSelectedSection("navbar")}
                  className={`relative flex items-center ${
                    navbarSettings.style === "centered" ? "justify-center" : "justify-between"
                  } px-4 py-2.5 border-b border-zinc-200 bg-white sticky top-0 cursor-pointer transition-all ${
                    selectedSection === "navbar"
                      ? "ring-2 ring-cyan-400 ring-inset"
                      : "hover:ring-2 hover:ring-cyan-200 hover:ring-inset"
                  }`}
                >
                  {navbarSettings.style !== "minimal" && navbarSettings.showLogo && (
                    <div className={`flex items-center gap-2 ${navbarSettings.style === "centered" ? "absolute left-4" : ""}`}>
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-cyan-500" />
                      {navbarSettings.style !== "centered" && (
                        <span className="text-sm font-bold text-zinc-800">{mockServer.name}</span>
                      )}
                    </div>
                  )}
                  {previewMode !== "mobile" && (
                    <div className={`flex gap-4 text-xs text-zinc-500 ${
                      navbarSettings.style === "centered" ? "" : ""
                    }`}>
                      {navbarSettings.links.map((link, i) => (
                        <span key={i}>{link.label}</span>
                      ))}
                    </div>
                  )}
                  {selectedSection === "navbar" && (
                    <div className="absolute top-1 right-2 px-2 py-0.5 bg-cyan-500 text-white text-[10px] rounded font-medium">
                      Editing
                    </div>
                  )}
                </div>

                {/* Sections */}
                <AnimatePresence mode="popLayout">
                  {visibleSections.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-16 text-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 mx-auto mb-3 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-zinc-300" />
                      </div>
                      <p className="text-zinc-400 text-sm">No visible sections</p>
                      <p className="text-zinc-300 text-xs mt-1">Add or enable sections to preview</p>
                    </motion.div>
                  ) : (
                    visibleSections.map((section) => (
                      <motion.div
                        key={section.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={() => setSelectedSection(section.id)}
                        className={`relative cursor-pointer transition-all ${
                          selectedSection === section.id
                            ? "ring-2 ring-cyan-400 ring-inset z-10"
                            : "hover:ring-2 hover:ring-cyan-200 hover:ring-inset"
                        }`}
                      >
                        <SectionPreview section={section} />
                        {selectedSection === section.id && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-cyan-500 text-white text-xs rounded-md font-medium shadow-lg">
                            Editing
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>

                {/* Mini Footer */}
                <div className="px-4 py-3 border-t border-zinc-100 text-center bg-white">
                  <p className="text-xs text-zinc-400">
                    Powered by <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">MCsite</span>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Fading Divider Right */}
          <div className="relative w-px flex-shrink-0 my-4">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-200 to-transparent" />
          </div>

          {/* Settings Panel */}
          <div className="w-64 flex-shrink-0 flex flex-col overflow-hidden p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 text-xs">Settings</h2>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {selectedSection === "navbar" ? (
                <div className="space-y-3">
                  {/* Navbar Style */}
                  <div>
                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Style</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { value: "default", label: "Default" },
                        { value: "centered", label: "Centered" },
                        { value: "minimal", label: "Minimal" },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setNavbarSettings({ ...navbarSettings, style: value as NavbarSettings["style"] })}
                          className={`p-1.5 rounded-md border transition-all text-center ${
                            navbarSettings.style === value
                              ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                              : "border-zinc-200 hover:border-zinc-300 text-zinc-500"
                          }`}
                        >
                          <span className="text-[10px] font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show Logo Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Show Logo</label>
                    <button
                      onClick={() => setNavbarSettings({ ...navbarSettings, showLogo: !navbarSettings.showLogo })}
                      className={`w-8 h-5 rounded-full transition-colors ${
                        navbarSettings.showLogo ? "bg-cyan-500" : "bg-zinc-300"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        navbarSettings.showLogo ? "translate-x-3.5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div>
                    <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Links</label>
                    <div className="space-y-1.5">
                      {navbarSettings.links.map((link, i) => (
                        <div key={i} className="flex gap-1">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...navbarSettings.links];
                              newLinks[i] = { ...newLinks[i], label: e.target.value };
                              setNavbarSettings({ ...navbarSettings, links: newLinks });
                            }}
                            placeholder="Label"
                            className="flex-1 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          />
                          <button
                            onClick={() => {
                              const newLinks = navbarSettings.links.filter((_, idx) => idx !== i);
                              setNavbarSettings({ ...navbarSettings, links: newLinks });
                            }}
                            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {navbarSettings.links.length < 6 && (
                        <button
                          onClick={() => {
                            setNavbarSettings({
                              ...navbarSettings,
                              links: [...navbarSettings.links, { label: "New Link", href: "/" }]
                            });
                          }}
                          className="w-full p-1.5 border border-dashed border-zinc-300 rounded-md text-[10px] text-zinc-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
                        >
                          + Add Link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : selectedSectionData ? (
                <div className="space-y-3">
                  <SettingsPanel
                    section={selectedSectionData}
                    onUpdate={(updates) => updateSection(selectedSectionData.id, updates)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => deleteSection(selectedSectionData.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Section
                  </motion.button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 mb-2 flex items-center justify-center">
                    <Type className="w-4 h-4 text-zinc-300" />
                  </div>
                  <p className="text-zinc-400 text-xs">No section selected</p>
                  <p className="text-zinc-300 text-[10px] mt-0.5">Click a section to edit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      <AnimatePresence>
        {showAddSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowAddSection(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                <div>
                  <h3 className="font-semibold text-zinc-900">Add Section</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Choose a section type to add to your page</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddSection(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </motion.button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {sectionCategories.map((category) => {
                  const categorySections = Object.entries(sectionTypeConfig).filter(
                    ([, config]) => config.category === category
                  );
                  if (categorySections.length === 0) return null;

                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === category ? "" : category)}
                        className="flex items-center gap-2 w-full text-left mb-2"
                      >
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${expandedCategory === category ? "" : "-rotate-90"}`} />
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{category}</span>
                      </button>
                      <AnimatePresence>
                        {expandedCategory === category && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="grid grid-cols-2 gap-2 overflow-hidden"
                          >
                            {categorySections.map(([type, config]) => (
                              <motion.button
                                key={type}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addSection(type)}
                                className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all text-left"
                              >
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                  <config.icon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-zinc-700 block">{config.label}</span>
                                  <span className="text-xs text-zinc-400 line-clamp-1">{config.description}</span>
                                </div>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
