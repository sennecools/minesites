"use client";

import type { ComponentType, ReactNode } from "react";
import {
  Layout,
  BarChart3,
  Sparkles,
  Trophy,
  MessageCircle,
  Image as ImageIcon,
  Users,
  AlignLeft,
  ListChecks,
  Vote,
  ShoppingBag,
  Star,
  HelpCircle,
  Video,
} from "lucide-react";

import type {
  SectionRenderProps,
  SectionSettings,
  SectionSettingsProps,
  SectionType,
} from "@/types/sections";
import { HeroRender } from "@/components/sections/render/hero-render";
import { HeroSettings } from "@/components/sections/settings/hero-settings";

/**
 * SECTION_REGISTRY — single source of truth for section type metadata.
 * Per Phase 1 decisions D-01 (rich shape) and D-02 (plain typed Record).
 *
 * Adding a new section type:
 *   1. Add the literal to SectionType in @/types/sections.
 *   2. Create the 2 files (render + settings) under @/components/sections/{render,settings}/.
 *   3. Add ONE entry to SECTION_REGISTRY below.
 * No edits to page.tsx or preview-client.tsx are needed.
 *
 * Phase 1 ships ONLY the Hero entry as real components (decision D-04). All other
 * SectionType members reference PlaceholderRender / PlaceholderSettings stubs so the
 * Record<SectionType, ...> exhaustiveness check is satisfied at compile time.
 */

export interface RegistryEntry {
  type: SectionType;
  render: ComponentType<SectionRenderProps>;
  settings: ComponentType<SectionSettingsProps>;
  defaultSettings: () => SectionSettings;
  displayName: string;
  icon: ReactNode;
  maxCount?: number;
}

// ---------- Placeholder stubs for non-extracted section types ----------
// These satisfy the Record<SectionType, RegistryEntry> exhaustiveness without forcing
// the registry to ship 14 component files in Phase 1. Per Phase 1 decision D-04
// and RESEARCH §Pattern 2.

function PlaceholderRender({ section }: SectionRenderProps) {
  return (
    <section className="py-16 bg-zinc-100">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{section.title || section.type}</h2>
        <p className="text-zinc-500 text-sm">Section type: {section.type}</p>
      </div>
    </section>
  );
}

function PlaceholderSettings(_props: SectionSettingsProps) {
  return null;
}

// ---------- The registry ----------
// `Record<SectionType, RegistryEntry>` enforces ONE entry per literal in SectionType.
// Removing any entry below produces a TypeScript error.

export const SECTION_REGISTRY: Record<SectionType, RegistryEntry> = {
  hero: {
    type: "hero",
    render: HeroRender,
    settings: HeroSettings,
    defaultSettings: () => ({
      hero: {
        alignment: "center",
        backgroundType: "gradient",
        backgroundColor: "#ffffff",
        gradientFrom: "#f0f9ff",
        gradientTo: "#ecfdf5",
        backgroundImage: "",
        imageBlur: 0,
        imageDarken: 40,
        playerBadge: "top",
        badgeStyle: "pill",
        showDiscordButton: true,
        discordButtonText: "Join Discord",
        showCopyIpButton: true,
        copyIpButtonText: "Copy IP",
      },
    }),
    displayName: "Hero Section",
    icon: <Layout className="w-4 h-4" />,
  },
  stats: {
    type: "stats",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Live Player Count",
    icon: <BarChart3 className="w-4 h-4" />,
    maxCount: 1,
  },
  features: {
    type: "features",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Features / About",
    icon: <Sparkles className="w-4 h-4" />,
  },
  gamemodes: {
    type: "gamemodes",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Game Modes",
    icon: <Trophy className="w-4 h-4" />,
  },
  discord: {
    type: "discord",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Discord CTA",
    icon: <MessageCircle className="w-4 h-4" />,
  },
  gallery: {
    type: "gallery",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Image Gallery",
    icon: <ImageIcon className="w-4 h-4" />,
  },
  staff: {
    type: "staff",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Staff",
    icon: <Users className="w-4 h-4" />,
  },
  text: {
    type: "text",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Text",
    icon: <AlignLeft className="w-4 h-4" />,
  },
  rules: {
    type: "rules",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Rules",
    icon: <ListChecks className="w-4 h-4" />,
  },
  voting: {
    type: "voting",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Voting Links",
    icon: <Vote className="w-4 h-4" />,
  },
  store: {
    type: "store",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Store",
    icon: <ShoppingBag className="w-4 h-4" />,
  },
  reviews: {
    type: "reviews",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Reviews",
    icon: <Star className="w-4 h-4" />,
  },
  faq: {
    type: "faq",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "FAQ",
    icon: <HelpCircle className="w-4 h-4" />,
  },
  video: {
    type: "video",
    render: PlaceholderRender,
    settings: PlaceholderSettings,
    defaultSettings: () => ({}),
    displayName: "Video",
    icon: <Video className="w-4 h-4" />,
  },
};
