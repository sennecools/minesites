"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  Undo2,
  Redo2,
  Layers,
  Server,
  Globe,
  Heart,
  Rocket,
  Loader2
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

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

type HeroSettings = {
  alignment?: "left" | "center" | "right";
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number; // 0-20
  imageDarken?: number; // 0-100
  playerBadge?: "top" | "bottom" | "hidden";
  badgeStyle?: "pill" | "minimal" | "card" | "glow";
  showDiscordButton?: boolean;
  discordButtonText?: string;
  showCopyIpButton?: boolean;
  copyIpButtonText?: string;
};

type GamemodesSettings = {
  layout?: "single" | "grid-2x2" | "grid-4" | "list";
  cardStyle?: "default" | "compact" | "minimal";
  alignment?: "left" | "center" | "right";
  headerAlignment?: "left" | "center" | "right";
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
  showPlayerCount?: boolean;
  showModpack?: boolean;
  showDescription?: boolean;
  showBadge?: boolean;
  showViewAllButton?: boolean;
};

type FeaturesSettings = {
  layout?: "2x1" | "2x2";
  headerAlignment?: "left" | "center" | "right";
  cardAlignment?: "left" | "center" | "right";
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
};

type FeatureItem = { title: string; description: string; icon: string };

type DiscordSettings = {
  layout?: "default" | "card-left" | "centered" | "compact";
  alignment?: "left" | "center" | "right";
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
  showBadge?: boolean;
  showStats?: boolean;
  memberCount?: number;
  onlineCount?: number;
  inviteCode?: string;
  buttonText?: string;
  guildName?: string;
  guildIcon?: string;
  guildBanner?: string;
};

type StatsServer = {
  id: string;
  name: string;
  address?: string;
  players?: number;
  maxPlayers?: number;
  status?: "online" | "offline";
};

type GalleryImage = {
  id: string;
  url: string;
  label?: string;
};

type GallerySettings = {
  layout?: "bento" | "grid" | "masonry";
  columns?: 2 | 3 | 4;
  images?: GalleryImage[];
  showLabels?: boolean;
  headerAlignment?: "left" | "center" | "right";
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
};

type StatsSettings = {
  mode?: "single" | "network";
  servers?: StatsServer[];
  layout?: "grid" | "list" | "compact";
  showTotal?: boolean;
  showVersion?: boolean;
  showUptime?: boolean;
  version?: string;
  uptime?: string;
  headerAlignment?: "left" | "center" | "right";
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
};

type StaffMemberSettings = {
  username: string;
  role: string;
  roleColor: string;
};

type StaffSettings = {
  layout?: "grid" | "list" | "compact";
  members?: StaffMemberSettings[];
  showOnlineStatus?: boolean;
  headerAlignment?: "left" | "center" | "right";
  // Background settings (using BackgroundConfig compatible fields)
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
};

type TextSettings = {
  content?: string;
  alignment?: "left" | "center" | "right";
  size?: "small" | "medium" | "large";
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
};

// Common background settings used across sections
type BackgroundConfig = {
  type?: "solid" | "gradient" | "image";
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  image?: string;
  blur?: number;
  darken?: number;
};

type SectionSettings = {
  alignment?: "left" | "center" | "right";
  layout?: "grid" | "list" | "cards";
  colorScheme?: "default" | "dark" | "accent"; // Legacy - being replaced by per-section background settings
  showBackground?: boolean;
  content?: {
    features?: FeatureItem[];
    modes?: string[];
    [key: string]: unknown;
  };
  // Section specific
  hero?: HeroSettings;
  gamemodes?: GamemodesSettings;
  features?: FeaturesSettings;
  discord?: DiscordSettings;
  stats?: StatsSettings;
  gallery?: GallerySettings;
  staff?: StaffSettings;
  text?: TextSettings;
};

type Section = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  visible: boolean;
  settings: SectionSettings;
};

// Reusable Background component for section previews
function SectionBackground({
  config,
  className = "",
  children,
}: {
  config: BackgroundConfig;
  className?: string;
  children: React.ReactNode;
}) {
  const {
    type = "solid",
    color = "#ffffff",
    gradientFrom = "#ffffff",
    gradientTo = "#f4f4f5",
    image = "",
    blur = 0,
    darken = 40,
  } = config;

  const getBackgroundStyle = () => {
    if (type === "solid") return { backgroundColor: color };
    if (type === "gradient") return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const hasImage = type === "image" && image;
  const isDark = hasImage || type === "solid" && isColorDark(color);

  return (
    <div className={`relative overflow-hidden ${className}`} style={getBackgroundStyle()}>
      {hasImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${image})`,
              filter: `blur(${blur}px)`,
              transform: "scale(1.1)",
            }}
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: darken / 100 }} />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

// Helper to determine if a hex color is dark
function isColorDark(hex: string): boolean {
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

// Reusable Background Settings panel component
function BackgroundSettingsPanel({
  config,
  onChange,
  defaultGradientFrom = "#ffffff",
  defaultGradientTo = "#f4f4f5",
}: {
  config: BackgroundConfig;
  onChange: (newConfig: BackgroundConfig) => void;
  defaultGradientFrom?: string;
  defaultGradientTo?: string;
}) {
  const bgType = config.type || "gradient";

  return (
    <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
      <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Background</h3>

      {/* Background Type */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: "solid", label: "Solid" },
          { value: "gradient", label: "Gradient" },
          { value: "image", label: "Image" },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange({ ...config, type: value as BackgroundConfig["type"] })}
            className={`p-2 rounded-lg border transition-all text-xs ${
              bgType === value
                ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Solid Color */}
      {bgType === "solid" && (
        <div>
          <label className="text-[11px] text-zinc-500 mb-1.5 block">Color</label>
          <div className="flex gap-2 items-center">
            <div className="color-picker" style={{ backgroundColor: config.color || "#ffffff" }}>
              <input
                type="color"
                value={config.color || "#ffffff"}
                onChange={(e) => onChange({ ...config, color: e.target.value })}
                className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
              />
            </div>
            <input
              type="text"
              placeholder="#ffffff"
              value={config.color ?? ""}
              onChange={(e) => onChange({ ...config, color: e.target.value })}
              className="input-field flex-1 min-w-0 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* Gradient Colors */}
      {bgType === "gradient" && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-zinc-500 mb-1.5 block">From</label>
            <div className="flex gap-2 items-center">
              <div className="color-picker" style={{ backgroundColor: config.gradientFrom || defaultGradientFrom }}>
                <input
                  type="color"
                  value={config.gradientFrom || defaultGradientFrom}
                  onChange={(e) => onChange({ ...config, gradientFrom: e.target.value })}
                  className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                />
              </div>
              <input
                type="text"
                placeholder={defaultGradientFrom}
                value={config.gradientFrom ?? ""}
                onChange={(e) => onChange({ ...config, gradientFrom: e.target.value })}
                className="input-field flex-1 min-w-0 text-xs font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 mb-1.5 block">To</label>
            <div className="flex gap-2 items-center">
              <div className="color-picker" style={{ backgroundColor: config.gradientTo || defaultGradientTo }}>
                <input
                  type="color"
                  value={config.gradientTo || defaultGradientTo}
                  onChange={(e) => onChange({ ...config, gradientTo: e.target.value })}
                  className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer opacity-0"
                />
              </div>
              <input
                type="text"
                placeholder={defaultGradientTo}
                value={config.gradientTo ?? ""}
                onChange={(e) => onChange({ ...config, gradientTo: e.target.value })}
                className="input-field flex-1 min-w-0 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Background */}
      {bgType === "image" && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-zinc-500 mb-1.5 block">Image URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={config.image || ""}
              onChange={(e) => onChange({ ...config, image: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 mb-1.5 block">Blur ({config.blur || 0}px)</label>
            <input
              type="range"
              min="0"
              max="20"
              value={config.blur || 0}
              onChange={(e) => onChange({ ...config, blur: parseInt(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 mb-1.5 block">Darken ({config.darken || 40}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.darken || 40}
              onChange={(e) => onChange({ ...config, darken: parseInt(e.target.value) })}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Header Settings panel component
function HeaderSettingsPanel({
  title,
  subtitle,
  alignment,
  onTitleChange,
  onSubtitleChange,
  onAlignmentChange,
  titlePlaceholder = "Enter title...",
  subtitlePlaceholder = "Enter subtitle...",
  showAlignment = true,
}: {
  title: string;
  subtitle: string;
  alignment: "left" | "center" | "right";
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onAlignmentChange: (value: "left" | "center" | "right") => void;
  titlePlaceholder?: string;
  subtitlePlaceholder?: string;
  showAlignment?: boolean;
}) {
  return (
    <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
      <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Header</h3>

      {/* Title */}
      <div>
        <label className="text-[11px] text-zinc-500 mb-1.5 block">Title</label>
        <input
          type="text"
          placeholder={titlePlaceholder}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="text-[11px] text-zinc-500 mb-1.5 block">Subtitle</label>
        <input
          type="text"
          placeholder={subtitlePlaceholder}
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Alignment */}
      {showAlignment && (
        <div>
          <label className="text-[11px] text-zinc-500 mb-1.5 block">Alignment</label>
          <div className="flex gap-2">
            {[
              { value: "left", icon: AlignLeft },
              { value: "center", icon: AlignCenter },
              { value: "right", icon: AlignRight },
            ].map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onAlignmentChange(value as "left" | "center" | "right")}
                className={`flex-1 p-2 rounded-lg border transition-all ${
                alignment === value
                  ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                  : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-400"
              }`}
            >
              <Icon className="w-4 h-4 mx-auto" />
            </button>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

const initialSections: Section[] = [
  {
    id: "1",
    type: "hero",
    title: mockServer.name,
    subtitle: "A community-driven Minecraft network for modded exploration and creativity.",
    visible: true,
    settings: {
      alignment: "center",
      hero: {
        alignment: "center",
        backgroundType: "gradient",
        gradientFrom: "#f0f9ff",
        gradientTo: "#ecfdf5",
        playerBadge: "top",
        showDiscordButton: true,
        discordButtonText: "Join Discord",
        showCopyIpButton: true,
        copyIpButtonText: "Copy IP",
        imageBlur: 0,
        imageDarken: 40,
      }
    }
  },
  {
    id: "2",
    type: "gamemodes",
    title: "Active Servers",
    subtitle: "Choose your adventure",
    visible: true,
    settings: {
      colorScheme: "default",
      content: {
        modes: ["All the Mods 10", "MoniFactory", "Custom Pack", "Vanilla+"]
      },
      gamemodes: {
        layout: "grid-2x2",
        cardStyle: "default",
        alignment: "left",
        showPlayerCount: true,
        showModpack: true,
        showDescription: true,
        showBadge: true,
        showViewAllButton: true,
      }
    }
  },
  {
    id: "3",
    type: "features",
    title: "Why Join Us?",
    subtitle: "Everything you need for the perfect Minecraft experience",
    visible: true,
    settings: {
      colorScheme: "default",
      content: {
        features: [
          { title: "Fast Performance", description: "Optimized servers with minimal lag for the best gameplay", icon: "zap" },
          { title: "Anti-Cheat Protection", description: "Advanced anti-cheat keeping the game fair for everyone", icon: "shield" },
          { title: "Active Community", description: "Active Discord community with events and giveaways", icon: "users" },
          { title: "24/7 Uptime", description: "99.9% uptime with 24/7 monitoring and support", icon: "star" }
        ]
      },
      features: {
        layout: "2x2",
        headerAlignment: "center",
        cardAlignment: "left",
        backgroundType: "gradient",
        gradientFrom: "#ffffff",
        gradientTo: "#f4f4f5",
      }
    }
  },
  {
    id: "4",
    type: "discord",
    title: "Join Our Discord",
    subtitle: "Connect with thousands of players, get support, and stay updated on server news.",
    visible: true,
    settings: {
      colorScheme: "default",
      discord: {
        alignment: "left",
        backgroundType: "gradient",
        gradientFrom: "#eef2ff",
        gradientTo: "#faf5ff",
        showStats: true,
        inviteCode: "",
        buttonText: "Join Server",
      }
    }
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
  text: { icon: Type, label: "Text Block", category: "Essential", description: "Custom text content" },
  stats: { icon: BarChart3, label: "Server Stats", category: "Essential", description: "Live player count and info" },
  features: { icon: Zap, label: "Features", category: "Essential", description: "Highlight server features" },
  gamemodes: { icon: Grid3X3, label: "Server List", category: "Essential", description: "Showcase your servers" },
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
  const hero = section.settings.hero || {};
  const {
    alignment = "center",
    backgroundType = "gradient",
    backgroundColor = "#ffffff",
    gradientFrom = "#f0f9ff",
    gradientTo = "#ecfdf5",
    backgroundImage = "",
    imageBlur = 0,
    imageDarken = 40,
    playerBadge = "top",
    badgeStyle = "pill",
    showDiscordButton = true,
    discordButtonText = "Join Discord",
    showCopyIpButton = true,
    copyIpButtonText = "Copy IP",
  } = hero;

  const hasImage = backgroundType === "image" && backgroundImage;
  const isLight = backgroundType === "solid" ? isLightColor(backgroundColor) : !hasImage;
  const textColor = hasImage || !isLight ? "text-white" : "text-zinc-900";
  const subtextColor = hasImage || !isLight ? "text-white/80" : "text-zinc-600";
  const isDark = hasImage || !isLight;

  // Helper to determine if a color is light
  function isLightColor(hex: string): boolean {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }

  // Background style
  const getBackgroundStyle = () => {
    if (backgroundType === "solid") {
      return { backgroundColor };
    }
    if (backgroundType === "gradient") {
      return { background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` };
    }
    return {};
  };

  // Different badge styles
  const PlayerBadge = () => {
    if (badgeStyle === "minimal") {
      return (
        <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${isDark ? "text-white/90" : "text-zinc-600"}`}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold">{mockServer.players}</span> online
        </div>
      );
    }

    if (badgeStyle === "card") {
      return (
        <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
          isDark
            ? "bg-white/10 backdrop-blur-md text-white border border-white/10"
            : "bg-white text-zinc-700 shadow-lg border border-zinc-100"
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
            <span className="font-bold text-lg">{mockServer.players}</span>
          </div>
          <div className={`w-px h-6 ${isDark ? "bg-white/20" : "bg-zinc-200"}`} />
          <span className={isDark ? "text-white/70" : "text-zinc-500"}>players online</span>
        </div>
      );
    }

    if (badgeStyle === "glow") {
      return (
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse" />
          <div className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            isDark
              ? "bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
            <span className="font-bold">{mockServer.players}</span>
            <span className={isDark ? "text-green-300/70" : "text-green-600"}>players online</span>
          </div>
        </div>
      );
    }

    // Default: pill style
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isDark
          ? "bg-white/10 backdrop-blur-sm text-white border border-white/20"
          : "bg-white text-zinc-600 shadow-sm border border-zinc-200"
      }`}>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {mockServer.players} players online
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden" style={getBackgroundStyle()}>
      {/* Background Image */}
      {hasImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              filter: imageBlur > 0 ? `blur(${imageBlur}px)` : undefined,
              transform: imageBlur > 0 ? "scale(1.1)" : undefined,
            }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: imageDarken / 100 }}
          />
        </>
      )}

      {/* Gradient decorations for non-image backgrounds */}
      {!hasImage && backgroundType === "gradient" && (
        <>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        </>
      )}

      <div className={`relative py-16 px-6 ${
        alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"
      }`}>
        <div className="max-w-2xl mx-auto">
          {/* Player badge - top */}
          {playerBadge === "top" && (
            <div className="mb-6">
              <PlayerBadge />
            </div>
          )}

          <h1 className={`text-4xl md:text-5xl font-extrabold mb-4 tracking-tight ${textColor}`}>
            {section.title}
          </h1>

          <p className={`text-lg max-w-xl mb-8 ${alignment === "center" ? "mx-auto" : alignment === "right" ? "ml-auto" : ""} ${subtextColor}`}>
            {section.subtitle}
          </p>

          {/* Player badge - bottom (before buttons) */}
          {playerBadge === "bottom" && (
            <div className="mb-6">
              <PlayerBadge />
            </div>
          )}

          {(showDiscordButton || showCopyIpButton) && (
            <div className={`flex gap-3 ${
              alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : ""
            }`}>
              {showDiscordButton && (
                <button className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 hover:-translate-y-0.5 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200">
                  {discordButtonText}
                </button>
              )}
              {showCopyIpButton && (
                <button className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 ${
                  isDark
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10"
                    : "bg-white hover:bg-zinc-50 text-zinc-700 shadow-sm border border-zinc-200 hover:shadow-md"
                }`}>
                  {copyIpButtonText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewStats({ section }: { section: Section }) {
  const {
    mode = "single",
    servers = [],
    layout = "grid",
    showTotal = true,
    showVersion = true,
    showUptime = true,
    version = mockServer.version,
    uptime = "99.9%",
    headerAlignment = "center",
    backgroundType = "solid",
    backgroundColor = "#18181b",
    gradientFrom = "#18181b",
    gradientTo = "#27272a",
    backgroundImage = "",
    imageBlur = 0,
    imageDarken = 40,
  } = section.settings.stats || {};

  const hasImage = backgroundType === "image" && backgroundImage;
  const isDark = hasImage || (backgroundType === "solid" && backgroundColor && isColorDark(backgroundColor)) ||
    (backgroundType === "gradient" && gradientFrom && isColorDark(gradientFrom));

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  // Default servers for network mode preview
  const displayServers: StatsServer[] = servers.length > 0 ? servers : [
    { id: "1", name: "Server 1", status: "online" },
    { id: "2", name: "Server 2", status: "online" },
    { id: "3", name: "Server 3", status: "online" },
  ];

  // Single server mode - show general stats
  if (mode === "single") {
    const stats = [
      { value: "—", label: "Players Online", icon: Users, color: "text-green-500", iconBg: "bg-green-500/10" },
      { value: "—", label: "Server Capacity", icon: Server, color: isDark ? "text-cyan-400" : "text-cyan-600", iconBg: "bg-cyan-500/10" },
      ...(showVersion ? [{ value: "—", label: "Minecraft Version", icon: Zap, color: isDark ? "text-amber-400" : "text-amber-600", iconBg: "bg-amber-500/10" }] : []),
      ...(showUptime ? [{ value: "—", label: "Uptime", icon: BarChart3, color: isDark ? "text-indigo-400" : "text-indigo-600", iconBg: "bg-indigo-500/10" }] : []),
    ];

    return (
      <div className="relative py-10 px-6 overflow-hidden @container" style={getBackgroundStyle()}>
        {hasImage && (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, filter: `blur(${imageBlur}px)`, transform: 'scale(1.1)' }} />
            <div className="absolute inset-0 bg-black" style={{ opacity: imageDarken / 100 }} />
          </>
        )}
        <div className="relative max-w-4xl mx-auto">
          {section.title && (
            <div className={`mb-6 ${headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left"}`}>
              <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                {section.title}
              </h2>
            </div>
          )}
          <div className={`${layout === "list" ? "space-y-3" : layout === "compact" ? "flex items-center justify-center gap-8 flex-wrap" : "grid grid-cols-2 @md:grid-cols-4 gap-4"}`}>
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`${
                  layout === "list"
                    ? "flex items-center justify-between px-5 py-4 rounded-xl"
                    : layout === "compact"
                      ? "text-center"
                      : "text-center py-5 px-4 rounded-xl"
                } ${layout !== "compact" ? (isDark
                    ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 hover:scale-[1.02] hover:-translate-y-1"
                    : "bg-white/80 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 shadow-sm"
                ) : ""} transition-all duration-200 cursor-pointer`}
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
                ) : layout === "compact" ? (
                  <>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className={`text-xs font-medium ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{stat.label}</div>
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
      </div>
    );
  }

  // Network mode - show multiple servers
  return (
    <div className="relative py-10 px-6 overflow-hidden @container" style={getBackgroundStyle()}>
      {hasImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, filter: `blur(${imageBlur}px)`, transform: 'scale(1.1)' }} />
          <div className="absolute inset-0 bg-black" style={{ opacity: imageDarken / 100 }} />
        </>
      )}
      <div className="relative max-w-4xl mx-auto">
        {/* Header with total */}
        <div className={`mb-6 ${headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left"}`}>
          {section.title && (
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
              {section.title}
            </h2>
          )}
          {showTotal && (
            <div className={`flex items-center gap-2 ${headerAlignment === "center" ? "justify-center" : headerAlignment === "right" ? "justify-end" : "justify-start"}`}>
              <span className="text-3xl font-bold text-green-500">—</span>
              <span className={`text-lg ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>/ — players online</span>
            </div>
          )}
        </div>

        {/* Server list */}
        {layout === "list" ? (
          <div className="space-y-3">
            {displayServers.map((server) => (
              <div
                key={server.id}
                className={`flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
                  isDark
                    ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
                    : "bg-white/80 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${server.status === "online" ? "bg-green-500" : "bg-red-500"}`} />
                  <span className={`font-medium ${isDark ? "text-white" : "text-zinc-900"}`}>{server.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-green-500 font-bold">—</span>
                    <span className={isDark ? "text-zinc-500" : "text-zinc-400"}> / —</span>
                  </div>
                  <div className={`w-24 h-2 rounded-full overflow-hidden ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : layout === "compact" ? (
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {displayServers.map((server) => (
              <div key={server.id} className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${server.status === "online" ? "bg-green-500" : "bg-red-500"}`} />
                  <span className={`text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{server.name}</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-green-500">—</span>
                  <span className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>/—</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 gap-4">
            {displayServers.map((server) => (
              <div
                key={server.id}
                className={`p-5 rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 ${
                  isDark
                    ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
                    : "bg-white/80 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${server.status === "online" ? "bg-green-500" : "bg-red-500"}`} />
                  <span className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{server.name}</span>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-green-500">—</span>
                  <span className={`text-lg ${isDark ? "text-zinc-500" : "text-zinc-400"}`}> / —</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Icon map for features
const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  shield: Shield,
  users: Users,
  star: Star,
  server: Server,
  globe: Globe,
  heart: Heart,
  trophy: Trophy,
  rocket: Rocket,
  sparkles: Sparkles,
};

const iconGradients = [
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-indigo-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
];

function PreviewFeatures({ section }: { section: Section }) {
  const rawFeatures = section.settings.content?.features;

  // Support both old format (string[]) and new format (object[])
  const features: FeatureItem[] = Array.isArray(rawFeatures)
    ? rawFeatures.map((f, i) =>
        typeof f === 'string'
          ? { title: f, description: "", icon: ["zap", "shield", "users", "star"][i] || "zap" }
          : f as FeatureItem
      )
    : [
        { title: "Fast Performance", description: "Optimized servers with minimal lag", icon: "zap" },
        { title: "Anti-Cheat", description: "Advanced anti-cheat protection", icon: "shield" },
        { title: "Active Community", description: "Join our Discord community", icon: "users" },
        { title: "24/7 Uptime", description: "Always online servers", icon: "star" },
      ];

  const {
    layout = "2x2",
    headerAlignment = "center",
    cardAlignment = "left",
    backgroundType = "gradient",
    backgroundColor = "#ffffff",
    gradientFrom = "#ffffff",
    gradientTo = "#f4f4f5",
    backgroundImage = "",
    imageBlur = 0,
    imageDarken = 40,
  } = section.settings.features || {};

  const hasImage = backgroundType === "image" && backgroundImage;
  const isDark = hasImage || (backgroundType === "solid" && backgroundColor && isColorDark(backgroundColor)) ||
    (backgroundType === "gradient" && gradientFrom && isColorDark(gradientFrom));

  const featureCount = layout === "2x1" ? 2 : 4;
  const headerAlignClass = headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left";
  const cardAlignClass = cardAlignment === "center" ? "text-center items-center" : cardAlignment === "right" ? "text-right items-end" : "text-left items-start";

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") {
      return { backgroundColor };
    }
    if (backgroundType === "gradient") {
      return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    }
    return {};
  };

  return (
    <div className="relative py-14 px-6 overflow-hidden" style={getBackgroundStyle()}>
      {/* Background Image */}
      {hasImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              filter: `blur(${imageBlur}px)`,
              transform: 'scale(1.1)',
            }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: imageDarken / 100 }}
          />
        </>
      )}

      <div className="relative max-w-5xl mx-auto @container">
        <div className={`mb-10 ${headerAlignClass}`}>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Why Join Us?"}
          </h2>
          {section.subtitle && (
            <p className={`text-base max-w-2xl ${headerAlignment === "center" ? "mx-auto" : headerAlignment === "right" ? "ml-auto" : ""} ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
              {section.subtitle}
            </p>
          )}
        </div>

        <div className={`grid gap-5 ${featureCount === 2 ? "@sm:grid-cols-2" : "@sm:grid-cols-2"}`}>
          {features.slice(0, featureCount).map((feature, i) => {
            const Icon = featureIcons[feature.icon] || Zap;
            const gradient = iconGradients[i % iconGradients.length];
            return (
              <div
                key={i}
                className={`feature-card p-5 rounded-2xl transition-all duration-200 flex flex-col cursor-pointer hover:-translate-y-1 ${cardAlignClass} ${
                  isDark
                    ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
                    : "bg-white/80 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg shadow-sm"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg icon-wiggle`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {feature.title}
                </h3>
                {feature.description && (
                  <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                    {feature.description}
                  </p>
                )}
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

  const {
    layout = "grid-2x2",
    cardStyle = "default",
    headerAlignment = "center",
    backgroundType = "solid",
    backgroundColor = "#fafafa",
    gradientFrom = "#fafafa",
    gradientTo = "#f4f4f5",
    backgroundImage = "",
    imageBlur = 0,
    imageDarken = 40,
    showPlayerCount = true,
    showModpack = true,
    showDescription = true,
    showBadge = true,
    showViewAllButton = true,
  } = section.settings.gamemodes || {};

  const hasImage = backgroundType === "image" && backgroundImage;
  const isDark = hasImage || (backgroundType === "solid" && backgroundColor && isColorDark(backgroundColor)) ||
    (backgroundType === "gradient" && gradientFrom && isColorDark(gradientFrom));

  const alignmentClass = headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left";

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") {
      return { backgroundColor };
    }
    if (backgroundType === "gradient") {
      return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    }
    return {};
  };

  const serverData = [
    { modpack: "ATM10", desc: "Endless tech, magic, and chaos.", players: 4, isPopular: true, bannerGradient: "from-emerald-400 via-cyan-500 to-blue-600", bannerPattern: true },
    { modpack: "MoniFactory v1.3", desc: "Factory-focused modpack with tight progression.", players: 0, isClosed: true, bannerGradient: "from-violet-500 via-purple-500 to-fuchsia-600", bannerPattern: false },
    { modpack: "Custom Pack", desc: "Our own curated modpack experience.", players: 12, bannerGradient: "from-amber-400 via-orange-500 to-red-500", bannerPattern: true },
    { modpack: "Vanilla+", desc: "Enhanced vanilla with quality of life mods.", players: 8, bannerGradient: "from-rose-400 via-pink-500 to-purple-500", bannerPattern: false },
  ];

  const gridClass = layout === "single"
    ? "max-w-2xl mx-auto"
    : layout === "grid-4"
      ? "flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none @sm:grid @sm:grid-cols-2 @sm:overflow-visible @lg:grid-cols-4"
      : layout === "list"
        ? "flex flex-col gap-3"
        : "grid @sm:grid-cols-2 gap-5";

  // For single layout, only show first server
  const displayModes = layout === "single" ? modes.slice(0, 1) : modes.slice(0, 4);

  return (
    <div className="relative py-14 px-6 overflow-hidden" style={getBackgroundStyle()}>
      {/* Background Image */}
      {hasImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              filter: `blur(${imageBlur}px)`,
              transform: 'scale(1.1)',
            }}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: imageDarken / 100 }}
          />
        </>
      )}

      <div className="relative max-w-5xl mx-auto @container">
        <div className={`mb-8 ${alignmentClass}`}>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Active Servers"}
          </h2>
          {section.subtitle && (
            <p className={`${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{section.subtitle}</p>
          )}
        </div>

        <div className={gridClass}>
          {displayModes.map((mode, i) => {
            const data = serverData[i] || serverData[0];

            // Single layout - large featured card
            if (layout === "single") {
              return (
                <div
                  key={i}
                  className={`group relative rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 ${
                    isDark
                      ? "bg-white/5 border border-white/10 hover:border-white/20"
                      : "bg-white/80 shadow-md hover:shadow-xl border border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {/* Large banner */}
                  <div className={`relative aspect-[2.5/1] bg-gradient-to-br ${data.bannerGradient}`}>
                    {data.bannerPattern && (
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '12px 12px'
                      }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {showBadge && data.isPopular && (
                      <span className="absolute top-4 right-4 text-sm font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-current" /> Popular
                      </span>
                    )}
                    {showBadge && data.isClosed && (
                      <span className="absolute top-4 right-4 text-sm font-bold bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg">
                        Closed
                      </span>
                    )}

                    {/* Player count overlay on banner */}
                    {showPlayerCount && !data.isClosed && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white font-medium">{data.players} online</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className={`text-2xl font-bold group-hover:text-indigo-600 transition-colors ${isDark ? "text-white" : "text-zinc-900"}`}>
                          {mode}
                        </h3>
                        {showModpack && <p className={`text-base ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{data.modpack}</p>}
                      </div>
                    </div>

                    {showDescription && (
                      <p className={`text-base mb-5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                        {data.desc}
                      </p>
                    )}

                    <button className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                      isDark
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                        : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-cyan-200/50"
                    }`}>
                      Join Server
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            // List layout - horizontal card
            if (layout === "list") {
              return (
                <div
                  key={i}
                  className={`group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
                    isDark
                      ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
                      : "bg-white/80 shadow-sm hover:shadow-lg border border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {/* Mini banner */}
                  <div className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${data.bannerGradient}`}>
                    {data.bannerPattern && (
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '8px 8px'
                      }} />
                    )}
                    {showBadge && data.isPopular && (
                      <span className="absolute top-1 right-1 bg-indigo-600 rounded p-0.5">
                        <Star className="w-2.5 h-2.5 text-white fill-current" />
                      </span>
                    )}
                    {showPlayerCount && (
                      <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px]">
                        <span className={`w-1.5 h-1.5 rounded-full ${data.isClosed ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
                        <span className="text-white font-medium">{data.isClosed ? "Off" : data.players}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold truncate ${isDark ? "text-white" : "text-zinc-900"}`}>{mode}</h3>
                      {showBadge && data.isClosed && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Closed</span>
                      )}
                    </div>
                    {showModpack && <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{data.modpack}</p>}
                  </div>

                  <button className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isDark
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-md"
                  }`}>
                    Join
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              );
            }

            // Compact style - smaller cards
            if (cardStyle === "compact") {
              return (
                <div
                  key={i}
                  className={`group relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    isDark
                      ? "bg-white/5 border border-white/10 hover:border-white/20"
                      : "bg-white/80 shadow-sm hover:shadow-md border border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className={`relative aspect-[3/1] bg-gradient-to-br ${data.bannerGradient}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {showBadge && (data.isPopular || data.isClosed) && (
                      <span className={`absolute top-2 right-2 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-lg shadow ${data.isClosed ? "bg-red-600" : "bg-indigo-600"}`}>
                        {data.isClosed ? "Closed" : "Popular"}
                      </span>
                    )}
                    {showPlayerCount && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        <span className={`w-1.5 h-1.5 rounded-full ${data.isClosed ? "bg-red-500" : "bg-green-500 animate-pulse"}`} />
                        <span className="text-[10px] text-white font-medium">{data.isClosed ? "Closed" : `${data.players}`}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>{mode}</h3>
                    {showModpack && <p className={`text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{data.modpack}</p>}
                    <button className={`w-full mt-2 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isDark
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                        : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                    }`}>
                      Join
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            }

            // Minimal style - text focused
            if (cardStyle === "minimal") {
              return (
                <div
                  key={i}
                  className={`group p-4 rounded-xl transition-all cursor-pointer border-l-4 ${
                    isDark
                      ? "bg-white/5 border-l-cyan-500 hover:bg-white/10"
                      : "bg-white/80 border-l-cyan-500 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{mode}</h3>
                      {showModpack && <p className={`text-sm ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{data.modpack}</p>}
                      {showDescription && <p className={`text-sm mt-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{data.desc}</p>}
                    </div>
                    {showBadge && (data.isPopular || data.isClosed) && (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        data.isClosed
                          ? "bg-red-100 text-red-600"
                          : "bg-indigo-100 text-indigo-600"
                      }`}>
                        {data.isClosed ? "Closed" : "Popular"}
                      </span>
                    )}
                  </div>
                  {showPlayerCount && !data.isClosed && (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium mt-3">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {data.players} online
                    </span>
                  )}
                </div>
              );
            }

            // Default style - full cards with banner
            return (
              <div
                key={i}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:-translate-y-1 ${
                  layout === "grid-4" ? "min-w-[260px] flex-shrink-0 snap-start @sm:min-w-0 @sm:flex-shrink" : ""
                } ${
                  isDark
                    ? "bg-white/5 border border-white/10 hover:border-white/20"
                    : "bg-white/80 shadow-sm hover:shadow-xl border border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className={`relative ${layout === "grid-4" ? "aspect-[2.5/1]" : "aspect-[2/1]"} bg-gradient-to-br ${data.bannerGradient}`}>
                  {data.bannerPattern && (
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '10px 10px'
                    }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {showBadge && data.isPopular && (
                    <span className={`absolute top-2 right-2 font-bold bg-indigo-600 text-white rounded-lg shadow-lg flex items-center gap-1 ${layout === "grid-4" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"}`}>
                      <Star className={`${layout === "grid-4" ? "w-2.5 h-2.5" : "w-3 h-3"} fill-current`} /> Popular
                    </span>
                  )}
                  {showBadge && data.isClosed && (
                    <span className={`absolute top-2 right-2 font-bold bg-red-600 text-white rounded-lg shadow-lg ${layout === "grid-4" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"}`}>
                      Closed
                    </span>
                  )}

                  {/* Player count overlay on banner */}
                  {showPlayerCount && !data.isClosed && (
                    <div className={`absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg ${layout === "grid-4" ? "px-2 py-1" : "px-2.5 py-1.5"}`}>
                      <span className={`rounded-full bg-green-500 animate-pulse ${layout === "grid-4" ? "w-1.5 h-1.5" : "w-2 h-2"}`} />
                      <span className={`text-white font-medium ${layout === "grid-4" ? "text-[10px]" : "text-xs"}`}>{data.players} online</span>
                    </div>
                  )}
                  {showPlayerCount && data.isClosed && (
                    <div className={`absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg ${layout === "grid-4" ? "px-2 py-1" : "px-2.5 py-1.5"}`}>
                      <span className={`rounded-full bg-red-500 ${layout === "grid-4" ? "w-1.5 h-1.5" : "w-2 h-2"}`} />
                      <span className={`text-white/80 font-medium ${layout === "grid-4" ? "text-[10px]" : "text-xs"}`}>Closed</span>
                    </div>
                  )}
                </div>

                <div className={layout === "grid-4" ? "p-3" : "p-4"}>
                  <div className="mb-2">
                    <h3 className={`${layout === "grid-4" ? "text-sm" : "text-lg"} font-bold group-hover:text-indigo-600 transition-colors ${isDark ? "text-white" : "text-zinc-900"}`}>
                      {mode}
                    </h3>
                    {showModpack && <p className={`${layout === "grid-4" ? "text-xs" : "text-sm"} ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{data.modpack}</p>}
                  </div>

                  {showDescription && layout !== "grid-4" && (
                    <p className={`text-sm mb-4 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      {data.desc}
                    </p>
                  )}

                  <button className={`w-full flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all ${
                    layout === "grid-4"
                      ? "px-2 py-1.5 text-xs"
                      : "px-4 py-2.5 text-sm"
                  } ${
                    isDark
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-cyan-200/50"
                  }`}>
                    Join Server
                    <ChevronRight className={layout === "grid-4" ? "w-3 h-3" : "w-4 h-4"} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {showViewAllButton && layout !== "single" && (
          <div className="mt-8 text-center">
            <button className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isDark
                ? "bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10"
                : "bg-white/80 text-zinc-700 hover:bg-white border border-zinc-200 shadow-sm"
            }`}>
              View all servers
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewDiscord({ section }: { section: Section }) {
  const {
    layout = "default",
    alignment = "left",
    backgroundType = "gradient",
    backgroundColor = "#eef2ff",
    gradientFrom = "#eef2ff",
    gradientTo = "#faf5ff",
    backgroundImage = "",
    imageBlur = 0,
    imageDarken = 40,
    showBadge = true,
    showStats = true,
    memberCount,
    onlineCount,
    buttonText = "Join Server",
    guildName,
    guildIcon,
    guildBanner,
    inviteCode,
  } = section.settings.discord || {};

  const formatCount = (count?: number) => {
    if (!count) return "—";
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const hasImage = backgroundType === "image" && backgroundImage;
  const isDark = hasImage || (backgroundType === "solid" && backgroundColor && isColorDark(backgroundColor));

  const alignmentClass = alignment === "center" ? "text-center items-center" : alignment === "right" ? "text-right items-end" : "text-left items-start";
  const statsJustify = alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start";

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  // Discord Card component
  const DiscordCard = ({ compact = false }: { compact?: boolean }) => (
    <div className={`rounded-2xl overflow-hidden shadow-2xl bg-[#2b2d31] flex-shrink-0 ${compact ? "w-full max-w-sm" : "w-full @md:w-80"}`}>
      <div className="relative h-24 bg-gradient-to-br from-indigo-500 to-purple-600">
        {guildBanner && (
          <img src={guildBanner} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute -bottom-6 left-4">
          {guildIcon ? (
            <img src={guildIcon} alt={guildName || "Discord server"} className="w-14 h-14 rounded-2xl border-4 border-[#2b2d31] object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 border-4 border-[#2b2d31] flex items-center justify-center">
              <span className="text-white font-bold text-lg">{(guildName || mockServer.name).charAt(0)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="pt-8 pb-4 px-4">
        <h3 className="text-white font-bold text-lg">{guildName || mockServer.name}</h3>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {formatCount(onlineCount)} Online
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            {formatCount(memberCount)} Members
          </span>
        </div>
        <button className="w-full mt-4 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-sm font-medium transition-colors">
          {buttonText}
        </button>
      </div>
    </div>
  );

  // Compact layout - no card, just CTA
  if (layout === "compact") {
    return (
      <div className="relative py-10 px-6 overflow-hidden @container" style={getBackgroundStyle()}>
        {hasImage && (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, filter: `blur(${imageBlur}px)`, transform: 'scale(1.1)' }} />
            <div className="absolute inset-0 bg-black" style={{ opacity: imageDarken / 100 }} />
          </>
        )}
        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col @md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {guildIcon ? (
                <img src={guildIcon} alt="" className="w-12 h-12 rounded-xl" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {section.title || "Join Our Discord"}
                </h2>
                {showStats && (memberCount || onlineCount) && (
                  <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    {formatCount(memberCount)} members · {formatCount(onlineCount)} online
                  </p>
                )}
              </div>
            </div>
            <button className="px-6 py-3 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-xl font-medium transition-colors flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Centered layout - card below text
  if (layout === "centered") {
    return (
      <div className="relative py-14 px-6 overflow-hidden @container" style={getBackgroundStyle()}>
        {hasImage && (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, filter: `blur(${imageBlur}px)`, transform: 'scale(1.1)' }} />
            <div className="absolute inset-0 bg-black" style={{ opacity: imageDarken / 100 }} />
          </>
        )}
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="flex flex-col items-center mb-8">
            {showBadge && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                <MessageCircle className="w-3.5 h-3.5" />
                Community
              </div>
            )}
            <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
              {section.title || "Join Our Discord"}
            </h2>
            {section.subtitle && (
              <p className={`text-base mb-6 max-w-lg ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                {section.subtitle}
              </p>
            )}
            {showStats && (memberCount || onlineCount) && (
              <div className="flex items-center gap-6 justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{formatCount(memberCount)}</div>
                  <div className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Members</div>
                </div>
                <div className={`w-px h-10 ${isDark ? "bg-zinc-600" : "bg-zinc-200"}`} />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{formatCount(onlineCount)}</div>
                  <div className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Online</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <DiscordCard />
          </div>
        </div>
      </div>
    );
  }

  // Default and card-left layouts
  // On mobile: always centered (text first, card below)
  // On desktop: side by side with card on left or right
  const isCardLeft = layout === "card-left";

  // Desktop alignment classes based on alignment setting
  const desktopAlignClass = alignment === "center"
    ? "@md:items-center @md:text-center"
    : alignment === "right"
      ? "@md:items-end @md:text-right"
      : "@md:items-start @md:text-left";

  const desktopStatsJustify = alignment === "center"
    ? "@md:justify-center"
    : alignment === "right"
      ? "@md:justify-end"
      : "@md:justify-start";

  return (
    <div className="relative py-14 px-6 overflow-hidden @container" style={getBackgroundStyle()}>
      {hasImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, filter: `blur(${imageBlur}px)`, transform: 'scale(1.1)' }} />
          <div className="absolute inset-0 bg-black" style={{ opacity: imageDarken / 100 }} />
        </>
      )}
      <div className="relative max-w-5xl mx-auto">
        <div className="flex flex-col @md:flex-row gap-8 items-center">
          {/* Text content - always first on mobile, order changes on desktop */}
          <div className={`flex-1 flex flex-col items-center text-center ${desktopAlignClass} ${isCardLeft ? "@md:order-2" : "@md:order-1"}`}>
            {showBadge && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                <MessageCircle className="w-3.5 h-3.5" />
                Community
              </div>
            )}
            <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
              {section.title || "Join Our Discord"}
            </h2>
            {section.subtitle && (
              <p className={`text-base mb-6 max-w-lg ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                {section.subtitle}
              </p>
            )}
            {showStats && (memberCount || onlineCount) && (
              <div className={`flex items-center gap-6 justify-center ${desktopStatsJustify}`}>
                <div className={`text-center ${alignment === "left" ? "@md:text-left" : alignment === "right" ? "@md:text-right" : ""}`}>
                  <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{formatCount(memberCount)}</div>
                  <div className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Members</div>
                </div>
                <div className={`w-px h-10 ${isDark ? "bg-zinc-600" : "bg-zinc-200"}`} />
                <div className={`text-center ${alignment === "left" ? "@md:text-left" : alignment === "right" ? "@md:text-right" : ""}`}>
                  <div className="text-2xl font-bold text-green-500">{formatCount(onlineCount)}</div>
                  <div className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Online</div>
                </div>
              </div>
            )}
            {showStats && !memberCount && !onlineCount && (
              <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Enter a Discord invite to show stats
              </p>
            )}
          </div>

          {/* Discord card - always second on mobile, order changes on desktop */}
          <div className={isCardLeft ? "@md:order-1" : "@md:order-2"}>
            <DiscordCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewGallery({ section }: { section: Section }) {
  const {
    layout = "bento",
    columns = 3,
    images = [],
    showLabels = true,
    headerAlignment = "center",
    backgroundType = "solid",
    backgroundColor = "#ffffff",
    gradientFrom = "#ffffff",
    gradientTo = "#f4f4f5",
    backgroundImage = "",
    imageBlur = 0,
    imageDarken = 40,
  } = section.settings.gallery || {};

  const hasBackgroundImage = backgroundType === "image" && backgroundImage;
  const isDark = hasBackgroundImage || (backgroundType === "solid" && backgroundColor && isColorDark(backgroundColor)) ||
    (backgroundType === "gradient" && gradientFrom && isColorDark(gradientFrom));

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  // Placeholder images when none are added
  const placeholderImages: GalleryImage[] = [
    { id: "1", url: "", label: "Spawn Area" },
    { id: "2", url: "", label: "PvP Arena" },
    { id: "3", url: "", label: "Shop District" },
    { id: "4", url: "", label: "Event Hall" },
  ];

  const placeholderGradients = [
    "from-emerald-400 via-cyan-500 to-blue-600",
    "from-violet-400 via-purple-500 to-fuchsia-600",
    "from-amber-400 via-orange-500 to-red-500",
    "from-rose-400 via-pink-500 to-purple-500",
  ];

  const displayImages = images.length > 0 ? images : placeholderImages;

  // Render a single image card
  const renderImageCard = (img: GalleryImage, index: number, extraClasses = "") => {
    const isPlaceholder = !img.url;
    const gradient = placeholderGradients[index % placeholderGradients.length];

    return (
      <div
        key={img.id}
        className={`relative rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${extraClasses}`}
      >
        {/* Image or placeholder gradient */}
        {isPlaceholder ? (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.2'%3E%3Cpath d='M5 0h1L0 5V4L4 0H5zm1 5v1H5L6 5zm-6 0l.5-.5L1 5H0zm0-5h.5L0 .5V0z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        ) : (
          <img src={img.url} alt={img.label || ""} className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Label */}
        {showLabels && img.label && (
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <h3 className="text-white font-bold text-lg drop-shadow-lg">{img.label}</h3>
              <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view
              </p>
            </div>
          </div>
        )}

        {/* Expand icon */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  };

  return (
    <div className="relative py-14 px-6 overflow-hidden @container" style={getBackgroundStyle()}>
      {hasBackgroundImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, filter: `blur(${imageBlur}px)`, transform: 'scale(1.1)' }} />
          <div className="absolute inset-0 bg-black" style={{ opacity: imageDarken / 100 }} />
        </>
      )}

      <div className="relative max-w-5xl mx-auto">
        <div className={`mb-10 ${headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left"}`}>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Screenshots"}
          </h2>
          {section.subtitle && (
            <p className={`${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
              {section.subtitle}
            </p>
          )}
        </div>

        {/* Bento layout - mixed sizes */}
        {layout === "bento" && (
          <div className="grid grid-cols-3 gap-3">
            {displayImages.slice(0, 4).map((img, i) =>
              renderImageCard(img, i, i === 0 || i === 3 ? "col-span-2 aspect-[2/1]" : "aspect-square")
            )}
          </div>
        )}

        {/* Grid layout - uniform sizes */}
        {layout === "grid" && (
          <div className={`grid gap-3 ${
            columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-2 @md:grid-cols-4" : "grid-cols-2 @md:grid-cols-3"
          }`}>
            {displayImages.map((img, i) =>
              renderImageCard(img, i, "aspect-video")
            )}
          </div>
        )}

        {/* Masonry layout - alternating heights */}
        {layout === "masonry" && (
          <div className={`columns-2 @md:columns-${columns} gap-3 space-y-3`}>
            {displayImages.map((img, i) => (
              <div key={img.id} className="break-inside-avoid">
                {renderImageCard(img, i, i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-video")}
              </div>
            ))}
          </div>
        )}

        {displayImages.length === 0 && (
          <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${
            isDark ? "border-white/20 text-zinc-400" : "border-zinc-300 text-zinc-500"
          }`}>
            <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No screenshots added yet</p>
            <p className="text-sm opacity-75">Add images in the settings panel</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewStaff({ section }: { section: Section }) {
  const staffSettings = section.settings.staff || {};
  const {
    layout = "grid",
    backgroundType = "solid",
    backgroundColor = "#fafafa",
    gradientFrom = "#fafafa",
    gradientTo = "#f4f4f5",
    showOnlineStatus = true,
    headerAlignment = "center",
    members = [],
  } = staffSettings;

  const isDark = (backgroundType === "solid" && isColorDark(backgroundColor)) ||
    (backgroundType === "gradient" && isColorDark(gradientFrom));

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  // Role color mapping
  const roleColors: Record<string, string> = {
    red: "text-red-500",
    orange: "text-orange-500",
    amber: "text-amber-500",
    yellow: "text-yellow-500",
    lime: "text-lime-500",
    green: "text-green-500",
    emerald: "text-emerald-500",
    teal: "text-teal-500",
    cyan: "text-cyan-500",
    sky: "text-sky-500",
    blue: "text-blue-500",
    indigo: "text-indigo-500",
    violet: "text-violet-500",
    purple: "text-purple-500",
    fuchsia: "text-fuchsia-500",
    pink: "text-pink-500",
    rose: "text-rose-500",
  };

  // Default staff for preview when no members configured
  const defaultStaff: StaffMemberSettings[] = [
    { username: "Notch", role: "Owner", roleColor: "red" },
    { username: "jeb_", role: "Admin", roleColor: "indigo" },
    { username: "Dinnerbone", role: "Moderator", roleColor: "emerald" },
    { username: "MHF_Steve", role: "Helper", roleColor: "cyan" },
  ];

  const displayStaff = members.length > 0 ? members : defaultStaff;

  const gridClass = layout === "list"
    ? "flex flex-col gap-3 max-w-2xl mx-auto"
    : layout === "compact"
      ? "flex flex-wrap justify-center gap-6"
      : "grid grid-cols-2 sm:grid-cols-4 gap-5";

  const alignmentClass = headerAlignment === "left" ? "text-left" : headerAlignment === "right" ? "text-right" : "text-center";

  return (
    <div className="relative py-14 px-6 overflow-hidden" style={getBackgroundStyle()}>
      <div className="relative max-w-5xl mx-auto">
        <div className={`${alignmentClass} mb-10`}>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Meet Our Team"}
          </h2>
          {section.subtitle && (
            <p className={isDark ? "text-zinc-400" : "text-zinc-600"}>{section.subtitle}</p>
          )}
        </div>

        <div className={gridClass}>
          {displayStaff.map((member) => {
            const colorClass = roleColors[member.roleColor] || "text-indigo-500";

            // List layout
            if (layout === "list") {
              return (
                <div
                  key={member.username}
                  className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
                    isDark
                      ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
                      : "bg-white border border-zinc-200 shadow-sm hover:shadow-lg hover:border-zinc-300"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={`https://minotar.net/bust/${member.username}/64`}
                      alt={member.username}
                      className="w-14 h-14 rounded-xl shadow-md group-hover:scale-105 transition-transform"
                    />
                    {!!showOnlineStatus && (
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 ${isDark ? "border-zinc-900" : "border-white"}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{member.username}</p>
                    <p className={`text-sm font-semibold ${colorClass}`}>{member.role}</p>
                  </div>
                </div>
              );
            }

            // Compact layout
            if (layout === "compact") {
              return (
                <div key={member.username} className="group text-center">
                  <div className="relative mx-auto mb-2">
                    <img
                      src={`https://minotar.net/bust/${member.username}/56`}
                      alt={member.username}
                      className="w-14 h-14 rounded-xl shadow-md group-hover:scale-110 transition-transform cursor-pointer"
                    />
                    {!!showOnlineStatus && (
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 ${isDark ? "border-zinc-900" : "border-zinc-50"}`} />
                    )}
                  </div>
                  <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>{member.username}</p>
                  <p className={`text-xs font-medium ${colorClass}`}>{member.role}</p>
                </div>
              );
            }

            // Default grid layout
            return (
              <div
                key={member.username}
                className={`group text-center p-5 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer ${
                  isDark
                    ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
                    : "bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:border-zinc-300"
                }`}
              >
                <div className="relative mx-auto mb-4 w-fit">
                  <img
                    src={`https://minotar.net/bust/${member.username}/80`}
                    alt={member.username}
                    className="w-20 h-20 rounded-2xl shadow-lg group-hover:scale-105 transition-transform"
                  />
                  {!!showOnlineStatus && (
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 ${isDark ? "border-zinc-900" : "border-white"}`} />
                  )}
                </div>
                <p className={`font-bold text-base ${isDark ? "text-white" : "text-zinc-900"}`}>{member.username}</p>
                <p className={`text-sm font-semibold mt-1 ${colorClass}`}>{member.role}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewText({ section }: { section: Section }) {
  const {
    content = "",
    alignment = "left",
    size = "medium",
    backgroundType = "solid",
    backgroundColor = "#ffffff",
    gradientFrom = "#ffffff",
    gradientTo = "#f4f4f5",
    backgroundImage = "",
    imageBlur = 0,
    imageDarken = 40,
  } = section.settings.text || {};

  const hasImage = backgroundType === "image" && backgroundImage;
  const isDark = hasImage || (backgroundType === "solid" && isColorDark(backgroundColor)) ||
    (backgroundType === "gradient" && isColorDark(gradientFrom));

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const alignmentClass = alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left";
  const sizeClass = size === "small" ? "text-sm" : size === "large" ? "text-lg" : "text-base";

  const displayContent = content || section.subtitle || "Add your custom text content here. You can use this section for announcements, descriptions, or any other information you want to share with your visitors.";

  return (
    <div className="relative py-12 px-6 overflow-hidden" style={getBackgroundStyle()}>
      {hasImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, filter: `blur(${imageBlur}px)`, transform: 'scale(1.1)' }} />
          <div className="absolute inset-0 bg-black" style={{ opacity: imageDarken / 100 }} />
        </>
      )}
      <div className="relative max-w-3xl mx-auto">
        {section.title && (
          <h2 className={`text-2xl font-bold mb-4 ${alignmentClass} ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title}
          </h2>
        )}
        <div className={`${alignmentClass} ${sizeClass} ${isDark ? "text-zinc-300" : "text-zinc-600"} leading-relaxed whitespace-pre-wrap`}>
          {displayContent}
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
    case "text": return <PreviewText section={section} />;
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
    <div className="space-y-4">
      {/* Section Title - not shown for sections that use HeaderSettingsPanel */}
      {!["features", "discord", "stats", "gallery", "gamemodes", "staff", "text"].includes(section.type) && (
        <div>
          <label className="settings-label">Title</label>
          <input
            type="text"
            placeholder="Enter title..."
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="input-field mt-2"
          />
        </div>
      )}

      {/* Hero Section Settings */}
      {section.type === "hero" && (
        <>
          {/* Subtitle */}
          <div>
            <label className="settings-label">Subtitle</label>
            <input
              type="text"
              placeholder="Enter subtitle..."
              value={section.subtitle || ""}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              className="input-field mt-2"
            />
          </div>

          {/* Alignment */}
          <div>
            <label className="settings-label">Alignment</label>
            <div className="flex gap-2 mt-2">
              {[
                { value: "left", icon: AlignLeft },
                { value: "center", icon: AlignCenter },
                { value: "right", icon: AlignRight },
              ].map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      hero: { ...section.settings.hero, alignment: value as "left" | "center" | "right" }
                    }
                  })}
                  className={`flex-1 p-2 rounded-lg border transition-all ${
                    section.settings.hero?.alignment === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-400"
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Background */}
          <BackgroundSettingsPanel
            config={{
              type: section.settings.hero?.backgroundType || "gradient",
              color: section.settings.hero?.backgroundColor || "#ffffff",
              gradientFrom: section.settings.hero?.gradientFrom || "#f0f9ff",
              gradientTo: section.settings.hero?.gradientTo || "#ecfdf5",
              image: section.settings.hero?.backgroundImage,
              blur: section.settings.hero?.imageBlur,
              darken: section.settings.hero?.imageDarken,
            }}
            onChange={(config) => onUpdate({
              settings: {
                ...section.settings,
                hero: {
                  ...section.settings.hero,
                  backgroundType: config.type,
                  backgroundColor: config.color,
                  gradientFrom: config.gradientFrom,
                  gradientTo: config.gradientTo,
                  backgroundImage: config.image,
                  imageBlur: config.blur,
                  imageDarken: config.darken,
                }
              }
            })}
            defaultGradientFrom="#f0f9ff"
            defaultGradientTo="#ecfdf5"
          />

          {/* Player Badge Group */}
          <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Player Badge</h3>

            {/* Position */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "top", label: "Top" },
                { value: "bottom", label: "Bottom" },
                { value: "hidden", label: "Hidden" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      hero: { ...section.settings.hero, playerBadge: value as "top" | "bottom" | "hidden" }
                    }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    section.settings.hero?.playerBadge === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Style */}
            {section.settings.hero?.playerBadge !== "hidden" && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "pill", label: "Pill" },
                  { value: "minimal", label: "Minimal" },
                  { value: "card", label: "Card" },
                  { value: "glow", label: "Glow" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({
                      settings: {
                        ...section.settings,
                        hero: { ...section.settings.hero, badgeStyle: value as "pill" | "minimal" | "card" | "glow" }
                      }
                    })}
                    className={`p-2 rounded-lg border transition-all text-xs ${
                      (section.settings.hero?.badgeStyle || "pill") === value
                        ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                        : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buttons Group */}
          <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Buttons</h3>

            {/* Discord Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdate({
                  settings: {
                    ...section.settings,
                    hero: { ...section.settings.hero, showDiscordButton: !section.settings.hero?.showDiscordButton }
                  }
                })}
                className={`w-8 h-5 rounded-full transition-all flex-shrink-0 ${
                  section.settings.hero?.showDiscordButton !== false ? "bg-cyan-500" : "bg-zinc-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  section.settings.hero?.showDiscordButton !== false ? "translate-x-3.5" : "translate-x-0.5"
                }`} />
              </button>
              <input
                type="text"
                placeholder="Join Discord"
                value={section.settings.hero?.discordButtonText ?? ""}
                onChange={(e) => onUpdate({
                  settings: {
                    ...section.settings,
                    hero: { ...section.settings.hero, discordButtonText: e.target.value }
                  }
                })}
                disabled={section.settings.hero?.showDiscordButton === false}
                className={`input-field flex-1 min-w-0 ${
                  section.settings.hero?.showDiscordButton === false ? "opacity-50" : ""
                }`}
              />
            </div>

            {/* Copy IP Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdate({
                  settings: {
                    ...section.settings,
                    hero: { ...section.settings.hero, showCopyIpButton: !section.settings.hero?.showCopyIpButton }
                  }
                })}
                className={`w-8 h-5 rounded-full transition-all flex-shrink-0 ${
                  section.settings.hero?.showCopyIpButton !== false ? "bg-cyan-500" : "bg-zinc-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  section.settings.hero?.showCopyIpButton !== false ? "translate-x-3.5" : "translate-x-0.5"
                }`} />
              </button>
              <input
                type="text"
                placeholder="Copy IP"
                value={section.settings.hero?.copyIpButtonText ?? ""}
                onChange={(e) => onUpdate({
                  settings: {
                    ...section.settings,
                    hero: { ...section.settings.hero, copyIpButtonText: e.target.value }
                  }
                })}
                disabled={section.settings.hero?.showCopyIpButton === false}
                className={`input-field flex-1 min-w-0 ${
                  section.settings.hero?.showCopyIpButton === false ? "opacity-50" : ""
                }`}
              />
            </div>
          </div>
        </>
      )}


      {/* Gallery Section Settings */}
      {section.type === "gallery" && (
        <>
          {/* Header */}
          <HeaderSettingsPanel
            title={section.title}
            subtitle={section.subtitle || ""}
            alignment={section.settings.gallery?.headerAlignment || "center"}
            onTitleChange={(value) => onUpdate({ title: value })}
            onSubtitleChange={(value) => onUpdate({ subtitle: value })}
            onAlignmentChange={(value) => onUpdate({
              settings: { ...section.settings, gallery: { ...section.settings.gallery, headerAlignment: value } }
            })}
            titlePlaceholder="Screenshots"
            subtitlePlaceholder="Take a look at our server..."
          />

          {/* Background */}
          <BackgroundSettingsPanel
            config={{
              type: section.settings.gallery?.backgroundType || "solid",
              color: section.settings.gallery?.backgroundColor || "#ffffff",
              gradientFrom: section.settings.gallery?.gradientFrom || "#ffffff",
              gradientTo: section.settings.gallery?.gradientTo || "#f4f4f5",
              image: section.settings.gallery?.backgroundImage,
              blur: section.settings.gallery?.imageBlur,
              darken: section.settings.gallery?.imageDarken,
            }}
            onChange={(config) => onUpdate({
              settings: {
                ...section.settings,
                gallery: {
                  ...section.settings.gallery,
                  backgroundType: config.type,
                  backgroundColor: config.color,
                  gradientFrom: config.gradientFrom,
                  gradientTo: config.gradientTo,
                  backgroundImage: config.image,
                  imageBlur: config.blur,
                  imageDarken: config.darken,
                }
              }
            })}
          />

          {/* Layout */}
          <div>
            <label className="settings-label">Layout</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "bento", label: "Bento" },
                { value: "grid", label: "Grid" },
                { value: "masonry", label: "Masonry" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      gallery: { ...section.settings.gallery, layout: value as "bento" | "grid" | "masonry" }
                    }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    (section.settings.gallery?.layout || "bento") === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Columns (for grid and masonry) */}
          {(section.settings.gallery?.layout === "grid" || section.settings.gallery?.layout === "masonry") && (
            <div>
              <label className="settings-label">Columns</label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdate({
                      settings: {
                        ...section.settings,
                        gallery: { ...section.settings.gallery, columns: num as 2 | 3 | 4 }
                      }
                    })}
                    className={`p-2 rounded-lg border transition-all text-xs ${
                      (section.settings.gallery?.columns || 3) === num
                        ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                        : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Options</h3>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Show image labels</span>
              <button
                onClick={() => onUpdate({
                  settings: {
                    ...section.settings,
                    gallery: { ...section.settings.gallery, showLabels: section.settings.gallery?.showLabels === false ? true : false }
                  }
                })}
                className={`w-8 h-5 rounded-full transition-colors ${
                  section.settings.gallery?.showLabels !== false ? "bg-cyan-500" : "bg-zinc-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  section.settings.gallery?.showLabels !== false ? "translate-x-3.5" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          </div>

          {/* Images Group */}
          <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Images</h3>
              <button
                onClick={() => {
                  const images = section.settings.gallery?.images || [];
                  onUpdate({
                    settings: {
                      ...section.settings,
                      gallery: {
                        ...section.settings.gallery,
                        images: [...images, { id: Date.now().toString(), url: "", label: `Image ${images.length + 1}` }]
                      }
                    }
                  });
                }}
                className="text-[11px] text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {(section.settings.gallery?.images || []).map((image, idx) => (
                <div key={image.id} className="p-2 bg-white rounded-lg border border-zinc-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Image label"
                      value={image.label || ""}
                      onChange={(e) => {
                        const images = [...(section.settings.gallery?.images || [])];
                        images[idx] = { ...images[idx], label: e.target.value };
                        onUpdate({
                          settings: {
                            ...section.settings,
                            gallery: { ...section.settings.gallery, images }
                          }
                        });
                      }}
                      className="input-field flex-1 text-xs"
                    />
                    <button
                      onClick={() => {
                        const images = (section.settings.gallery?.images || []).filter((_, i) => i !== idx);
                        onUpdate({
                          settings: {
                            ...section.settings,
                            gallery: { ...section.settings.gallery, images }
                          }
                        });
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={image.url}
                    onChange={(e) => {
                      const images = [...(section.settings.gallery?.images || [])];
                      images[idx] = { ...images[idx], url: e.target.value };
                      onUpdate({
                        settings: {
                          ...section.settings,
                          gallery: { ...section.settings.gallery, images }
                        }
                      });
                    }}
                    className="input-field text-xs"
                  />
                  {image.url && (
                    <div className="h-16 rounded-lg overflow-hidden bg-zinc-100">
                      <img src={image.url} alt={image.label || ""} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
              {(!section.settings.gallery?.images || section.settings.gallery.images.length === 0) && (
                <p className="text-[11px] text-zinc-400 text-center py-3">No images added. Showing placeholders.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Stats Section Settings */}
      {section.type === "stats" && (
        <>
          {/* Header */}
          <HeaderSettingsPanel
            title={section.title}
            subtitle={section.subtitle || ""}
            alignment={section.settings.stats?.headerAlignment || "center"}
            onTitleChange={(value) => onUpdate({ title: value })}
            onSubtitleChange={(value) => onUpdate({ subtitle: value })}
            onAlignmentChange={(value) => onUpdate({
              settings: { ...section.settings, stats: { ...section.settings.stats, headerAlignment: value } }
            })}
            titlePlaceholder="Server Statistics"
            subtitlePlaceholder="Real-time server information"
          />

          {/* Background */}
          <BackgroundSettingsPanel
            config={{
              type: section.settings.stats?.backgroundType || "solid",
              color: section.settings.stats?.backgroundColor || "#18181b",
              gradientFrom: section.settings.stats?.gradientFrom || "#18181b",
              gradientTo: section.settings.stats?.gradientTo || "#27272a",
              image: section.settings.stats?.backgroundImage,
              blur: section.settings.stats?.imageBlur,
              darken: section.settings.stats?.imageDarken,
            }}
            onChange={(config) => onUpdate({
              settings: {
                ...section.settings,
                stats: {
                  ...section.settings.stats,
                  backgroundType: config.type,
                  backgroundColor: config.color,
                  gradientFrom: config.gradientFrom,
                  gradientTo: config.gradientTo,
                  backgroundImage: config.image,
                  imageBlur: config.blur,
                  imageDarken: config.darken,
                }
              }
            })}
            defaultGradientFrom="#18181b"
            defaultGradientTo="#27272a"
          />

          {/* Mode */}
          <div>
            <label className="settings-label">Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "single", label: "Single Server" },
                { value: "network", label: "Network" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      stats: { ...section.settings.stats, mode: value as "single" | "network" }
                    }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    (section.settings.stats?.mode || "single") === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="settings-label">Layout</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "grid", label: "Grid" },
                { value: "list", label: "List" },
                { value: "compact", label: "Compact" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      stats: { ...section.settings.stats, layout: value as "grid" | "list" | "compact" }
                    }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    (section.settings.stats?.layout || "grid") === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Single Server Options */}
          {(section.settings.stats?.mode || "single") === "single" && (
            <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Stats Options</h3>

              {/* Show Version Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Show version</span>
                <button
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      stats: { ...section.settings.stats, showVersion: section.settings.stats?.showVersion === false ? true : false }
                    }
                  })}
                  className={`w-8 h-5 rounded-full transition-colors ${
                    section.settings.stats?.showVersion !== false ? "bg-cyan-500" : "bg-zinc-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    section.settings.stats?.showVersion !== false ? "translate-x-3.5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              {section.settings.stats?.showVersion !== false && (
                <div>
                  <label className="text-[11px] text-zinc-500 mb-1.5 block">Version</label>
                  <input
                    type="text"
                    placeholder="1.20.4"
                    value={section.settings.stats?.version || ""}
                    onChange={(e) => onUpdate({
                      settings: {
                        ...section.settings,
                        stats: { ...section.settings.stats, version: e.target.value }
                      }
                    })}
                    className="input-field"
                  />
                </div>
              )}

              {/* Show Uptime Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                <span className="text-[11px] text-zinc-500">Show uptime</span>
                <button
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      stats: { ...section.settings.stats, showUptime: section.settings.stats?.showUptime === false ? true : false }
                    }
                  })}
                  className={`w-8 h-5 rounded-full transition-colors ${
                    section.settings.stats?.showUptime !== false ? "bg-cyan-500" : "bg-zinc-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    section.settings.stats?.showUptime !== false ? "translate-x-3.5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              {section.settings.stats?.showUptime !== false && (
                <div>
                  <label className="text-[11px] text-zinc-500 mb-1.5 block">Uptime</label>
                  <input
                    type="text"
                    placeholder="99.9%"
                    value={section.settings.stats?.uptime || ""}
                    onChange={(e) => onUpdate({
                      settings: {
                        ...section.settings,
                        stats: { ...section.settings.stats, uptime: e.target.value }
                      }
                    })}
                    className="input-field"
                  />
                </div>
              )}
            </div>
          )}

          {/* Network Options */}
          {section.settings.stats?.mode === "network" && (
            <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Network Options</h3>

              {/* Show Total Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Show total players</span>
                <button
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      stats: { ...section.settings.stats, showTotal: section.settings.stats?.showTotal === false ? true : false }
                    }
                  })}
                  className={`w-8 h-5 rounded-full transition-colors ${
                    section.settings.stats?.showTotal !== false ? "bg-cyan-500" : "bg-zinc-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    section.settings.stats?.showTotal !== false ? "translate-x-3.5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              {/* Servers List */}
              <div className="pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-zinc-500">Servers</span>
                  <button
                    onClick={() => {
                      const servers = section.settings.stats?.servers || [];
                      onUpdate({
                        settings: {
                          ...section.settings,
                          stats: {
                            ...section.settings.stats,
                            servers: [...servers, { id: Date.now().toString(), name: `Server ${servers.length + 1}`, players: 0, maxPlayers: 100, status: "online" as const }]
                          }
                        }
                      });
                    }}
                    className="text-[11px] text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {(section.settings.stats?.servers || []).map((server, idx) => (
                    <div key={server.id} className="p-2 bg-white rounded-lg border border-zinc-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Server name"
                          value={server.name}
                          onChange={(e) => {
                            const servers = [...(section.settings.stats?.servers || [])];
                            servers[idx] = { ...servers[idx], name: e.target.value };
                            onUpdate({
                              settings: {
                                ...section.settings,
                                stats: { ...section.settings.stats, servers }
                              }
                            });
                          }}
                          className="input-field flex-1 text-xs"
                        />
                        <button
                          onClick={() => {
                            const servers = (section.settings.stats?.servers || []).filter((_, i) => i !== idx);
                            onUpdate({
                              settings: {
                                ...section.settings,
                                stats: { ...section.settings.stats, servers }
                              }
                            });
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-zinc-400 mb-1 block">Max Players</label>
                          <input
                            type="number"
                            value={server.maxPlayers || 100}
                            onChange={(e) => {
                              const servers = [...(section.settings.stats?.servers || [])];
                              servers[idx] = { ...servers[idx], maxPlayers: parseInt(e.target.value) || 100 };
                              onUpdate({
                                settings: {
                                  ...section.settings,
                                  stats: { ...section.settings.stats, servers }
                                }
                              });
                            }}
                            className="input-field text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 mb-1 block">Address (optional)</label>
                          <input
                            type="text"
                            placeholder="play.server.com"
                            value={server.address || ""}
                            onChange={(e) => {
                              const servers = [...(section.settings.stats?.servers || [])];
                              servers[idx] = { ...servers[idx], address: e.target.value };
                              onUpdate({
                                settings: {
                                  ...section.settings,
                                  stats: { ...section.settings.stats, servers }
                                }
                              });
                            }}
                            className="input-field text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!section.settings.stats?.servers || section.settings.stats.servers.length === 0) && (
                    <p className="text-[11px] text-zinc-400 text-center py-2">No servers added. Using demo data.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Features Section Settings */}
      {section.type === "features" && (
        <>
          {/* Header */}
          <HeaderSettingsPanel
            title={section.title}
            subtitle={section.subtitle || ""}
            alignment={section.settings.features?.headerAlignment || "center"}
            onTitleChange={(value) => onUpdate({ title: value })}
            onSubtitleChange={(value) => onUpdate({ subtitle: value })}
            onAlignmentChange={(value) => onUpdate({
              settings: { ...section.settings, features: { ...section.settings.features, headerAlignment: value } }
            })}
            titlePlaceholder="Server Features"
            subtitlePlaceholder="What makes us special"
          />

          {/* Background */}
          <BackgroundSettingsPanel
            config={{
              type: section.settings.features?.backgroundType || "gradient",
              color: section.settings.features?.backgroundColor || "#ffffff",
              gradientFrom: section.settings.features?.gradientFrom || "#ffffff",
              gradientTo: section.settings.features?.gradientTo || "#f4f4f5",
              image: section.settings.features?.backgroundImage,
              blur: section.settings.features?.imageBlur,
              darken: section.settings.features?.imageDarken,
            }}
            onChange={(config) => onUpdate({
              settings: {
                ...section.settings,
                features: {
                  ...section.settings.features,
                  backgroundType: config.type,
                  backgroundColor: config.color,
                  gradientFrom: config.gradientFrom,
                  gradientTo: config.gradientTo,
                  backgroundImage: config.image,
                  imageBlur: config.blur,
                  imageDarken: config.darken,
                }
              }
            })}
          />

          {/* Layout */}
          <div>
            <label className="settings-label">Layout</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: "2x1", label: "2 Features" },
                { value: "2x2", label: "4 Features" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      features: { ...section.settings.features, layout: value as "2x1" | "2x2" }
                    }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    (section.settings.features?.layout || "2x2") === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Features Content */}
          <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Features</h3>

            {/* Card Alignment */}
            <div>
              <label className="text-[11px] text-zinc-500 mb-1.5 block">Alignment</label>
              <div className="flex gap-2">
                {[
                  { value: "left", icon: AlignLeft },
                  { value: "center", icon: AlignCenter },
                  { value: "right", icon: AlignRight },
                ].map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({
                      settings: {
                        ...section.settings,
                        features: { ...section.settings.features, cardAlignment: value as "left" | "center" | "right" }
                      }
                    })}
                    className={`flex-1 p-2 rounded-lg border transition-all ${
                      (section.settings.features?.cardAlignment || "left") === value
                        ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                        : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-400"
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const featureCount = section.settings.features?.layout === "2x1" ? 2 : 4;
              const defaultFeatures = [
                { title: "Feature 1", description: "", icon: "zap" },
                { title: "Feature 2", description: "", icon: "shield" },
                { title: "Feature 3", description: "", icon: "users" },
                { title: "Feature 4", description: "", icon: "star" },
              ];
              const currentFeatures = section.settings.content?.features as Array<{title: string; description: string; icon: string}> || defaultFeatures;
              // Ensure we always have the right number of features
              const features = currentFeatures.slice(0, featureCount);
              while (features.length < featureCount) {
                features.push(defaultFeatures[features.length]);
              }
              return features.map((feature, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-zinc-100 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-400">Feature {i + 1}</span>
                    <select
                      value={feature.icon || "zap"}
                      onChange={(e) => {
                        const newFeatures = [...features];
                        newFeatures[i] = { ...newFeatures[i], icon: e.target.value };
                        onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, features: newFeatures } } });
                      }}
                      className="select-field text-xs py-1"
                    >
                      {Object.keys(featureIcons).map((icon) => (
                        <option key={icon} value={icon}>{icon.charAt(0).toUpperCase() + icon.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Feature title..."
                    value={feature.title || ""}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[i] = { ...newFeatures[i], title: e.target.value };
                      onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, features: newFeatures } } });
                    }}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Short description..."
                    value={feature.description || ""}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[i] = { ...newFeatures[i], description: e.target.value };
                      onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, features: newFeatures } } });
                    }}
                    className="input-field text-xs"
                  />
                </div>
              ));
            })()}
          </div>
        </>
      )}

      {/* Gamemodes Section Settings */}
      {section.type === "gamemodes" && (
        <>
          {/* Header */}
          <HeaderSettingsPanel
            title={section.title}
            subtitle={section.subtitle || ""}
            alignment={section.settings.gamemodes?.headerAlignment || "center"}
            onTitleChange={(value) => onUpdate({ title: value })}
            onSubtitleChange={(value) => onUpdate({ subtitle: value })}
            onAlignmentChange={(value) => onUpdate({
              settings: { ...section.settings, gamemodes: { ...section.settings.gamemodes, headerAlignment: value } }
            })}
            titlePlaceholder="Game Modes"
            subtitlePlaceholder="Choose your adventure"
          />

          {/* Background */}
          <BackgroundSettingsPanel
            config={{
              type: section.settings.gamemodes?.backgroundType || "solid",
              color: section.settings.gamemodes?.backgroundColor || "#fafafa",
              gradientFrom: section.settings.gamemodes?.gradientFrom || "#fafafa",
              gradientTo: section.settings.gamemodes?.gradientTo || "#f4f4f5",
              image: section.settings.gamemodes?.backgroundImage,
              blur: section.settings.gamemodes?.imageBlur,
              darken: section.settings.gamemodes?.imageDarken,
            }}
            onChange={(config) => onUpdate({
              settings: {
                ...section.settings,
                gamemodes: {
                  ...section.settings.gamemodes,
                  backgroundType: config.type,
                  backgroundColor: config.color,
                  gradientFrom: config.gradientFrom,
                  gradientTo: config.gradientTo,
                  backgroundImage: config.image,
                  imageBlur: config.blur,
                  imageDarken: config.darken,
                }
              }
            })}
          />

          {/* Layout */}
          <div>
            <label className="settings-label">Layout</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: "single", label: "Single" },
                { value: "grid-2x2", label: "2×2 Grid" },
                { value: "grid-4", label: "4 Columns" },
                { value: "list", label: "List" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      gamemodes: { ...section.settings.gamemodes, layout: value as "single" | "grid-2x2" | "grid-4" | "list" }
                    }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    (section.settings.gamemodes?.layout || "grid-2x2") === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Card Style */}
          <div>
            <label className="settings-label">Card Style</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: "default", label: "Default" },
                { value: "compact", label: "Compact" },
                { value: "minimal", label: "Minimal" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      gamemodes: { ...section.settings.gamemodes, cardStyle: value as "default" | "compact" | "minimal" }
                    }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    (section.settings.gamemodes?.cardStyle || "default") === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="rounded-lg bg-zinc-50/50 p-3 space-y-2">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Display Options</h3>
            {[
              { key: "showPlayerCount", label: "Player count" },
              { key: "showModpack", label: "Modpack name" },
              { key: "showDescription", label: "Description" },
              { key: "showBadge", label: "Status badge" },
              { key: "showViewAllButton", label: "View all button" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-zinc-600">{label}</span>
                <button
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      gamemodes: {
                        ...section.settings.gamemodes,
                        [key]: !(section.settings.gamemodes?.[key as keyof GamemodesSettings] !== false)
                      }
                    }
                  })}
                  className={`w-8 h-5 rounded-full transition-all flex-shrink-0 ${
                    section.settings.gamemodes?.[key as keyof GamemodesSettings] !== false ? "bg-cyan-500" : "bg-zinc-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    section.settings.gamemodes?.[key as keyof GamemodesSettings] !== false ? "translate-x-3.5" : "translate-x-0.5"
                  }`} />
                </button>
              </label>
            ))}
          </div>
        </>
      )}

      {/* Content Editor for Game Modes */}
      {section.type === "gamemodes" && (
        <div>
          <label className="settings-label">Servers</label>
          <div className="space-y-2">
            {((section.settings.content?.modes as string[]) || []).map((mode, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={mode}
                  onChange={(e) => {
                    const newModes = [...((section.settings.content?.modes as string[]) || [])];
                    newModes[i] = e.target.value;
                    onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, modes: newModes } } });
                  }}
                  className="input-field flex-1"
                />
                <button
                  onClick={() => {
                    const newModes = ((section.settings.content?.modes as string[]) || []).filter((_, idx) => idx !== i);
                    onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, modes: newModes } } });
                  }}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {((section.settings.content?.modes as string[]) || []).length < 4 && (
              <button
                onClick={() => {
                  const newModes = [...((section.settings.content?.modes as string[]) || []), "New Mode"];
                  onUpdate({ settings: { ...section.settings, content: { ...section.settings.content, modes: newModes } } });
                }}
                className="w-full p-2 border border-dashed border-zinc-300 rounded-lg text-xs text-zinc-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
              >
                + Add Mode
              </button>
            )}
          </div>
        </div>
      )}

      {/* Discord Section Settings */}
      {section.type === "discord" && (
        <>
          {/* Header */}
          <HeaderSettingsPanel
            title={section.title}
            subtitle={section.subtitle || ""}
            alignment={section.settings.discord?.alignment || "left"}
            onTitleChange={(value) => onUpdate({ title: value })}
            onSubtitleChange={(value) => onUpdate({ subtitle: value })}
            onAlignmentChange={(value) => onUpdate({
              settings: {
                ...section.settings,
                discord: { ...section.settings.discord, alignment: value }
              }
            })}
            showAlignment={section.settings.discord?.layout !== "centered" && section.settings.discord?.layout !== "compact"}
          />

          {/* Background */}
          <BackgroundSettingsPanel
            config={{
              type: section.settings.discord?.backgroundType || "gradient",
              color: section.settings.discord?.backgroundColor || "#eef2ff",
              gradientFrom: section.settings.discord?.gradientFrom || "#eef2ff",
              gradientTo: section.settings.discord?.gradientTo || "#faf5ff",
              image: section.settings.discord?.backgroundImage,
              blur: section.settings.discord?.imageBlur,
              darken: section.settings.discord?.imageDarken,
            }}
            onChange={(config) => onUpdate({
              settings: {
                ...section.settings,
                discord: {
                  ...section.settings.discord,
                  backgroundType: config.type,
                  backgroundColor: config.color,
                  gradientFrom: config.gradientFrom,
                  gradientTo: config.gradientTo,
                  backgroundImage: config.image,
                  imageBlur: config.blur,
                  imageDarken: config.darken,
                }
              }
            })}
          />

          {/* Layout Style */}
          <div>
            <label className="settings-label">Layout</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: "default", label: "Card Right" },
                { value: "card-left", label: "Card Left" },
                { value: "centered", label: "Centered" },
                { value: "compact", label: "Compact" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      discord: { ...section.settings.discord, layout: value as DiscordSettings["layout"] }
                    }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    (section.settings.discord?.layout || "default") === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          {section.settings.discord?.layout !== "compact" && (
            <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Options</h3>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Show community badge</span>
                <button
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      discord: { ...section.settings.discord, showBadge: section.settings.discord?.showBadge === false ? true : false }
                    }
                  })}
                  className={`w-8 h-5 rounded-full transition-colors ${
                    section.settings.discord?.showBadge !== false ? "bg-cyan-500" : "bg-zinc-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    section.settings.discord?.showBadge !== false ? "translate-x-3.5" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* Discord Server Group */}
          <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Discord Server</h3>

            <div>
              <label className="text-[11px] text-zinc-500 mb-1.5 block">Invite Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="discord.gg/abc123"
                  value={section.settings.discord?.inviteCode || ""}
                  onChange={(e) => onUpdate({
                    settings: {
                      ...section.settings,
                      discord: { ...section.settings.discord, inviteCode: e.target.value }
                    }
                  })}
                  className="input-field flex-1"
                />
                <button
                  onClick={async () => {
                    const code = section.settings.discord?.inviteCode;
                    if (!code) return;
                    try {
                      const res = await fetch(`/api/discord/invite?code=${encodeURIComponent(code)}`);
                      if (!res.ok) {
                        const err = await res.json();
                        alert(err.error || "Failed to fetch invite");
                        return;
                      }
                      const data = await res.json();
                      onUpdate({
                        settings: {
                          ...section.settings,
                          discord: {
                            ...section.settings.discord,
                            memberCount: data.memberCount,
                            onlineCount: data.onlineCount,
                            guildName: data.guild.name,
                            guildIcon: data.guild.iconUrl,
                            guildBanner: data.guild.bannerUrl || data.guild.splashUrl,
                          }
                        }
                      });
                    } catch {
                      alert("Failed to fetch invite info");
                    }
                  }}
                  disabled={!section.settings.discord?.inviteCode}
                  className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Fetch
                </button>
              </div>
            </div>

            {/* Show fetched server info */}
            {section.settings.discord?.guildName && (
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-zinc-100">
                {section.settings.discord?.guildIcon ? (
                  <img
                    src={section.settings.discord.guildIcon}
                    alt=""
                    className="w-10 h-10 rounded-xl"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold">{section.settings.discord.guildName.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{section.settings.discord.guildName}</p>
                  <p className="text-xs text-zinc-500">
                    {section.settings.discord.memberCount?.toLocaleString()} members · {section.settings.discord.onlineCount?.toLocaleString()} online
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] text-zinc-500 mb-1.5 block">Button Text</label>
              <input
                type="text"
                placeholder="Join Server"
                value={section.settings.discord?.buttonText || ""}
                onChange={(e) => onUpdate({
                  settings: {
                    ...section.settings,
                    discord: { ...section.settings.discord, buttonText: e.target.value }
                  }
                })}
                className="input-field"
              />
            </div>

            {/* Show Stats Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
              <span className="text-[11px] text-zinc-500">Show stats in section</span>
              <button
                onClick={() => onUpdate({
                  settings: {
                    ...section.settings,
                    discord: { ...section.settings.discord, showStats: section.settings.discord?.showStats === false ? true : false }
                  }
                })}
                className={`w-8 h-5 rounded-full transition-colors ${
                  section.settings.discord?.showStats !== false ? "bg-cyan-500" : "bg-zinc-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  section.settings.discord?.showStats !== false ? "translate-x-3.5" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Staff Section Settings */}
      {section.type === "staff" && (
        <>
          {/* Header */}
          <HeaderSettingsPanel
            title={section.title}
            subtitle={section.subtitle || ""}
            alignment={section.settings.staff?.headerAlignment || "center"}
            onTitleChange={(value) => onUpdate({ title: value })}
            onSubtitleChange={(value) => onUpdate({ subtitle: value })}
            onAlignmentChange={(value) => onUpdate({
              settings: { ...section.settings, staff: { ...section.settings.staff, headerAlignment: value } }
            })}
            titlePlaceholder="Meet Our Team"
            subtitlePlaceholder="The people who keep the server running"
          />

          {/* Background */}
          <BackgroundSettingsPanel
            config={{
              type: section.settings.staff?.backgroundType || "solid",
              color: section.settings.staff?.backgroundColor || "#fafafa",
              gradientFrom: section.settings.staff?.gradientFrom || "#fafafa",
              gradientTo: section.settings.staff?.gradientTo || "#f4f4f5",
              image: section.settings.staff?.backgroundImage,
              blur: section.settings.staff?.imageBlur,
              darken: section.settings.staff?.imageDarken,
            }}
            onChange={(config) => onUpdate({
              settings: {
                ...section.settings,
                staff: {
                  ...section.settings.staff,
                  backgroundType: config.type,
                  backgroundColor: config.color,
                  gradientFrom: config.gradientFrom,
                  gradientTo: config.gradientTo,
                  backgroundImage: config.image,
                  imageBlur: config.blur,
                  imageDarken: config.darken,
                }
              }
            })}
            defaultGradientFrom="#fafafa"
            defaultGradientTo="#f4f4f5"
          />

          {/* Layout */}
          <div>
            <label className="settings-label">Layout</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: "grid", label: "Grid" },
                { value: "list", label: "List" },
                { value: "compact", label: "Compact" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: {
                      ...section.settings,
                      staff: { ...section.settings.staff, layout: value as "grid" | "list" | "compact" }
                    }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    section.settings.staff?.layout === value || (!section.settings.staff?.layout && value === "grid")
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Options</h3>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Show online status</span>
              <button
                onClick={() => onUpdate({
                  settings: {
                    ...section.settings,
                    staff: {
                      ...section.settings.staff,
                      showOnlineStatus: section.settings.staff?.showOnlineStatus === false ? true : false
                    }
                  }
                })}
                className={`w-8 h-5 rounded-full transition-colors ${
                  section.settings.staff?.showOnlineStatus !== false ? "bg-cyan-500" : "bg-zinc-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  section.settings.staff?.showOnlineStatus !== false ? "translate-x-3.5" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          </div>

          {/* Staff Members */}
          <div className="rounded-lg bg-zinc-50/50 p-3 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Staff Members</h3>
            <div className="space-y-2">
              {(section.settings.staff?.members || []).map((member, i) => (
                <div key={i} className="flex gap-2 items-start p-2 bg-white rounded-lg border border-zinc-100">
                  <img
                    src={`https://minotar.net/bust/${member.username || "Steve"}/32`}
                    alt={member.username || "Steve"}
                    className="w-8 h-8 rounded"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      placeholder="Username"
                      value={member.username}
                      onChange={(e) => {
                        const members = [...(section.settings.staff?.members || [])];
                        members[i] = { ...members[i], username: e.target.value };
                        onUpdate({ settings: { ...section.settings, staff: { ...section.settings.staff, members } } });
                      }}
                      className="input-field text-xs"
                    />
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Role"
                        value={member.role}
                        onChange={(e) => {
                          const members = [...(section.settings.staff?.members || [])];
                          members[i] = { ...members[i], role: e.target.value };
                          onUpdate({ settings: { ...section.settings, staff: { ...section.settings.staff, members } } });
                        }}
                        className="input-field text-xs flex-1"
                      />
                      <select
                        value={member.roleColor}
                        onChange={(e) => {
                          const members = [...(section.settings.staff?.members || [])];
                          members[i] = { ...members[i], roleColor: e.target.value };
                          onUpdate({ settings: { ...section.settings, staff: { ...section.settings.staff, members } } });
                        }}
                        className="select-field text-xs w-20"
                      >
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                        <option value="amber">Amber</option>
                        <option value="green">Green</option>
                        <option value="emerald">Emerald</option>
                        <option value="cyan">Cyan</option>
                        <option value="blue">Blue</option>
                        <option value="indigo">Indigo</option>
                        <option value="purple">Purple</option>
                        <option value="pink">Pink</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const members = (section.settings.staff?.members || []).filter((_, idx) => idx !== i);
                      onUpdate({ settings: { ...section.settings, staff: { ...section.settings.staff, members } } });
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const members = [...(section.settings.staff?.members || []), { username: "", role: "Member", roleColor: "indigo" }];
                  onUpdate({ settings: { ...section.settings, staff: { ...section.settings.staff, members } } });
                }}
                className="w-full p-2 border border-dashed border-zinc-300 rounded-lg text-xs text-zinc-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
              >
                + Add Staff Member
              </button>
            </div>
          </div>
        </>
      )}

      {/* Text Section Settings */}
      {section.type === "text" && (
        <>
          {/* Background */}
          <BackgroundSettingsPanel
            config={{
              type: section.settings.text?.backgroundType || "solid",
              color: section.settings.text?.backgroundColor || "#ffffff",
              gradientFrom: section.settings.text?.gradientFrom || "#ffffff",
              gradientTo: section.settings.text?.gradientTo || "#f4f4f5",
              image: section.settings.text?.backgroundImage,
              blur: section.settings.text?.imageBlur,
              darken: section.settings.text?.imageDarken,
            }}
            onChange={(config) => onUpdate({
              settings: {
                ...section.settings,
                text: {
                  ...section.settings.text,
                  backgroundType: config.type,
                  backgroundColor: config.color,
                  gradientFrom: config.gradientFrom,
                  gradientTo: config.gradientTo,
                  backgroundImage: config.image,
                  imageBlur: config.blur,
                  imageDarken: config.darken,
                }
              }
            })}
          />

          {/* Alignment */}
          <div>
            <label className="settings-label">Alignment</label>
            <div className="flex gap-2 mt-2">
              {[
                { value: "left", icon: AlignLeft },
                { value: "center", icon: AlignCenter },
                { value: "right", icon: AlignRight },
              ].map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: { ...section.settings, text: { ...section.settings.text, alignment: value as "left" | "center" | "right" } }
                  })}
                  className={`flex-1 p-2 rounded-lg border transition-all ${
                    (section.settings.text?.alignment || "left") === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-400"
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto" />
                </button>
              ))}
            </div>
          </div>

          {/* Text Size */}
          <div>
            <label className="settings-label">Text Size</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({
                    settings: { ...section.settings, text: { ...section.settings.text, size: value as "small" | "medium" | "large" } }
                  })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    (section.settings.text?.size || "medium") === value
                      ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                      : "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="settings-label">Content</label>
            <textarea
              placeholder="Enter your text content..."
              value={section.settings.text?.content || ""}
              onChange={(e) => onUpdate({
                settings: { ...section.settings, text: { ...section.settings.text, content: e.target.value } }
              })}
              rows={6}
              className="input-field mt-2 resize-none"
            />
          </div>
        </>
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
  const params = useParams();
  const serverId = params.serverId as string;

  const [sections, setSectionsInternal] = useState<Section[]>(initialSections);
  const [history, setHistory] = useState<Section[][]>([]);
  const [future, setFuture] = useState<Section[][]>([]);
  const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>(initialNavbarSettings);
  const [selectedSection, setSelectedSection] = useState<string | null>("1");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showAddSection, setShowAddSection] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string>("Essential");

  // Server data state
  const [serverData, setServerData] = useState(mockServer);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load server data on mount
  useEffect(() => {
    const loadServerData = async () => {
      try {
        const response = await fetch(`/api/servers/${serverId}`);
        if (!response.ok) {
          throw new Error("Failed to load server data");
        }

        const data = await response.json();

        setServerData({
          id: data.id,
          name: data.name,
          subdomain: data.subdomain,
          description: data.description || "",
          serverIp: data.serverIp || "",
          published: data.published || false,
          players: 0, // Would come from a live status API
          maxPlayers: 500,
          version: "1.20.4",
        });

        if (data.navbar) {
          setNavbarSettings(data.navbar as NavbarSettings);
        }

        if (data.sections && data.sections.length > 0) {
          const loadedSections = data.sections.map((s: {
            id: string;
            type: string;
            title?: string;
            subtitle?: string;
            settings?: Record<string, unknown>;
            visible?: boolean;
          }) => ({
            id: s.id,
            type: s.type,
            title: s.title || "",
            subtitle: s.subtitle,
            visible: s.visible ?? true,
            settings: s.settings || {},
          }));
          setSectionsInternal(loadedSections);
          if (loadedSections.length > 0) {
            setSelectedSection(loadedSections[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading server:", error);
        setLoadError(error instanceof Error ? error.message : "Failed to load server");
      } finally {
        setIsLoading(false);
      }
    };

    loadServerData();
  }, [serverId]);

  // Track unsaved changes by comparing to saved state
  const savedStateRef = useRef<{ sections: string; navbar: string } | null>(null);

  // Store saved state after initial load
  useEffect(() => {
    if (!isLoading && savedStateRef.current === null) {
      savedStateRef.current = {
        sections: JSON.stringify(sections),
        navbar: JSON.stringify(navbarSettings),
      };
    }
  }, [isLoading, sections, navbarSettings]);

  // Compare current state to saved state
  useEffect(() => {
    if (!isLoading && savedStateRef.current !== null) {
      const currentSections = JSON.stringify(sections);
      const currentNavbar = JSON.stringify(navbarSettings);
      const hasChanges =
        currentSections !== savedStateRef.current.sections ||
        currentNavbar !== savedStateRef.current.navbar;
      setHasUnsavedChanges(hasChanges);
    }
  }, [sections, navbarSettings, isLoading]);

  // Save function
  const saveServer = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/servers/${serverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: serverData.name,
          subdomain: serverData.subdomain,
          description: serverData.description,
          serverIp: serverData.serverIp,
          navbar: navbarSettings,
          sections: sections.map((s, index) => ({
            id: s.id,
            type: s.type,
            title: s.title,
            subtitle: s.subtitle,
            settings: s.settings,
            visible: s.visible,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      // Update saved state ref to current state
      savedStateRef.current = {
        sections: JSON.stringify(sections),
        navbar: JSON.stringify(navbarSettings),
      };
      setHasUnsavedChanges(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [serverId, serverData, navbarSettings, sections]);

  // Track changes for undo/redo
  const setSections = (newSections: Section[] | ((prev: Section[]) => Section[])) => {
    const resolved = typeof newSections === "function" ? newSections(sections) : newSections;
    setHistory((prev) => [...prev.slice(-19), sections]); // Keep last 20 states
    setFuture([]);
    setSectionsInternal(resolved);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [sections, ...f]);
    setSectionsInternal(prev);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, sections]);
    setSectionsInternal(next);
  };

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

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

    // Scroll to the new section after render
    setTimeout(() => {
      const element = document.querySelector(`[data-section-id="${newSection.id}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleCopyIP = () => {
    navigator.clipboard.writeText(serverData.serverIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="-m-6 h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-zinc-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="-m-6 h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-zinc-900 font-medium">Failed to load server</p>
          <p className="text-zinc-500 text-sm">{loadError}</p>
          <Link
            href="/dashboard"
            className="mt-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm hover:bg-zinc-800 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

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
        <span className="text-zinc-900 font-medium">{serverData.name}</span>
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
                {serverData.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="text-sm text-zinc-500">{serverData.subdomain}.minesites.net</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              Unsaved changes
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open(`/${serverData.subdomain}?preview=true`, '_blank')}
            className="flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveServer}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-shadow disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Saving..." : "Publish"}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex gap-0 min-h-0">
        {/* Main Editor Container */}
        <div className="flex-1 flex rounded-2xl bg-white border border-zinc-200/80 shadow-sm overflow-hidden">
          {/* Sections List */}
          <div className="w-56 xl:w-72 flex-shrink-0 flex flex-col overflow-hidden px-2.5 xl:px-3 py-3 border-r border-zinc-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 text-sm">Sections</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddSection(true)}
                className="p-1.5 rounded-md bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-md transition-shadow"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {/* Locked Navbar Section */}
              <div
                onClick={() => setSelectedSection("navbar")}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer transition-all mb-1.5 ${
                  selectedSection === "navbar"
                    ? "border-cyan-300 bg-gradient-to-r from-cyan-50 to-emerald-50"
                    : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
                }`}
              >
                <div className="text-zinc-300 flex-shrink-0">
                  <div className="w-3.5 h-3.5" /> {/* Spacer where grip would be */}
                </div>
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                    selectedSection === "navbar"
                      ? "bg-gradient-to-br from-cyan-500 to-emerald-500"
                      : "bg-zinc-200"
                  }`}
                >
                  <Layout className={`w-3 h-3 ${selectedSection === "navbar" ? "text-white" : "text-zinc-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">Navigation</p>
                  <p className="text-[11px] text-zinc-400">Locked</p>
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
                        className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-cyan-300 bg-gradient-to-r from-cyan-50 to-emerald-50"
                            : "border-transparent hover:border-zinc-200 hover:bg-zinc-50"
                        } ${!section.visible ? "opacity-50" : ""}`}
                      >
                        <div className="cursor-grab text-zinc-300 hover:text-zinc-400 flex-shrink-0">
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-gradient-to-br from-cyan-500 to-emerald-500"
                              : section.visible
                              ? "bg-zinc-100"
                              : "bg-zinc-200"
                          }`}
                        >
                          <Icon className={`w-3 h-3 ${isSelected ? "text-white" : "text-zinc-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 truncate">{section.title}</p>
                          <p className="text-[11px] text-zinc-400 capitalize">{section.type}</p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisibility(section.id);
                            }}
                            className="p-1 rounded hover:bg-white transition-colors"
                          >
                            {section.visible ? (
                              <Eye className="w-3 h-3 text-zinc-400" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-zinc-400" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSection(section.id);
                            }}
                            className="p-1 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-zinc-400 hover:text-red-500" />
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
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1.5 bg-zinc-50 rounded-lg text-xs font-mono text-zinc-600 truncate">
                  {serverData.serverIp}
                </code>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyIP}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
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
                <span className="text-xs text-zinc-500">{serverData.subdomain}.minesites.net</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={canUndo ? { scale: 1.05 } : {}}
                    whileTap={canUndo ? { scale: 0.95 } : {}}
                    onClick={undo}
                    disabled={!canUndo}
                    className={`p-1.5 rounded-md transition-colors ${
                      canUndo
                        ? "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                        : "text-zinc-300 cursor-not-allowed"
                    }`}
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={canRedo ? { scale: 1.05 } : {}}
                    whileTap={canRedo ? { scale: 0.95 } : {}}
                    onClick={redo}
                    disabled={!canRedo}
                    className={`p-1.5 rounded-md transition-colors ${
                      canRedo
                        ? "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                        : "text-zinc-300 cursor-not-allowed"
                    }`}
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </motion.button>
                </div>
                {/* Device Mode */}
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
                  className={`group relative flex items-center ${
                    navbarSettings.style === "centered" ? "justify-center" : "justify-between"
                  } px-4 py-2.5 border-b border-zinc-200 bg-white sticky top-0 cursor-pointer`}
                >
                  {navbarSettings.style !== "minimal" && navbarSettings.showLogo && (
                    <div className={`flex items-center gap-2 ${navbarSettings.style === "centered" ? "absolute left-4" : ""}`}>
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-cyan-500" />
                      {navbarSettings.style !== "centered" && (
                        <span className="text-sm font-bold text-zinc-800">{serverData.name}</span>
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
                  {/* Hover/Selected border overlay */}
                  <div className={`absolute inset-0 pointer-events-none transition-all border-2 ${
                    selectedSection === "navbar"
                      ? "border-cyan-400"
                      : "border-transparent group-hover:border-cyan-300"
                  }`} />
                  {selectedSection === "navbar" && (
                    <div className="absolute top-1 right-2 px-2 py-0.5 bg-cyan-500 text-white text-[10px] rounded font-medium z-10">
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
                        data-section-id={section.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onClick={() => setSelectedSection(section.id)}
                        className="relative cursor-pointer group"
                      >
                        <SectionPreview section={section} />
                        {/* Hover/Selected border overlay */}
                        <div className={`absolute inset-0 pointer-events-none transition-all border-2 ${
                          selectedSection === section.id
                            ? "border-cyan-400"
                            : "border-transparent group-hover:border-cyan-300"
                        }`} />
                        {selectedSection === section.id && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-cyan-500 text-white text-xs rounded-md font-medium shadow-lg z-10">
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
                    Powered by <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">MineSites</span>
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
          <div className="w-56 xl:w-72 flex-shrink-0 flex flex-col overflow-hidden p-3 xl:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 text-sm">Settings</h2>
            </div>

            <div className="relative flex-1 min-h-0">
              {/* Top fade */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />

              <div className="h-full overflow-y-auto scrollbar-none py-2">
              {selectedSection === "navbar" ? (
                <div className="space-y-4">
                  {/* Navbar Style */}
                  <div>
                    <label className="settings-label">Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "default", label: "Default" },
                        { value: "centered", label: "Centered" },
                        { value: "minimal", label: "Minimal" },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setNavbarSettings({ ...navbarSettings, style: value as NavbarSettings["style"] })}
                          className={`p-2 rounded-lg border transition-all text-center ${
                            navbarSettings.style === value
                              ? "border-cyan-300 bg-cyan-50 text-cyan-600"
                              : "border-zinc-200 hover:border-zinc-300 text-zinc-500"
                          }`}
                        >
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Show Logo Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="settings-label">Show Logo</label>
                    <button
                      onClick={() => setNavbarSettings({ ...navbarSettings, showLogo: !navbarSettings.showLogo })}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        navbarSettings.showLogo ? "bg-cyan-500" : "bg-zinc-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        navbarSettings.showLogo ? "translate-x-4.5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div>
                    <label className="settings-label">Links</label>
                    <div className="space-y-2">
                      {navbarSettings.links.map((link, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...navbarSettings.links];
                              newLinks[i] = { ...newLinks[i], label: e.target.value };
                              setNavbarSettings({ ...navbarSettings, links: newLinks });
                            }}
                            placeholder="Label"
                            className="input-field flex-1"
                          />
                          <button
                            onClick={() => {
                              const newLinks = navbarSettings.links.filter((_, idx) => idx !== i);
                              setNavbarSettings({ ...navbarSettings, links: newLinks });
                            }}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
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
                          className="w-full p-2 border border-dashed border-zinc-300 rounded-lg text-xs text-zinc-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
                        >
                          + Add Link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : selectedSectionData ? (
                <SettingsPanel
                  section={selectedSectionData}
                  onUpdate={(updates) => updateSection(selectedSectionData.id, updates)}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 mb-3 flex items-center justify-center">
                    <Type className="w-5 h-5 text-zinc-300" />
                  </div>
                  <p className="text-zinc-400 text-sm">No section selected</p>
                  <p className="text-zinc-300 text-xs mt-1">Click a section to edit</p>
                </div>
              )}
              </div>
            </div>

            {/* Delete Section - at bottom */}
            {selectedSectionData && (
              <div className="pt-3 mt-3 border-t border-zinc-100">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => deleteSection(selectedSectionData.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Section
                </motion.button>
              </div>
            )}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowAddSection(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden h-[520px] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Add Section</h3>
                  <p className="text-sm text-zinc-500 mt-0.5">Choose a section to add to your page</p>
                </div>
                <button
                  onClick={() => setShowAddSection(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {sectionCategories.map((category, categoryIndex) => {
                  const categorySections = Object.entries(sectionTypeConfig).filter(
                    ([, config]) => config.category === category && !config.locked
                  );
                  if (categorySections.length === 0) return null;

                  const isExpanded = expandedCategory === category;
                  const categoryColors = [
                    { bg: "bg-gradient-to-br from-cyan-500 to-teal-500", light: "bg-cyan-50/50", border: "border-cyan-200/60", text: "text-cyan-600", dot: "bg-cyan-500" },
                    { bg: "bg-gradient-to-br from-violet-500 to-purple-500", light: "bg-violet-50/50", border: "border-violet-200/60", text: "text-violet-600", dot: "bg-violet-500" },
                    { bg: "bg-gradient-to-br from-amber-500 to-orange-500", light: "bg-amber-50/50", border: "border-amber-200/60", text: "text-amber-600", dot: "bg-amber-500" },
                    { bg: "bg-gradient-to-br from-emerald-500 to-green-500", light: "bg-emerald-50/50", border: "border-emerald-200/60", text: "text-emerald-600", dot: "bg-emerald-500" },
                    { bg: "bg-gradient-to-br from-rose-500 to-pink-500", light: "bg-rose-50/50", border: "border-rose-200/60", text: "text-rose-600", dot: "bg-rose-500" },
                  ];
                  const color = categoryColors[categoryIndex % categoryColors.length];

                  return (
                    <div key={category} className="border-b border-zinc-100 last:border-b-0">
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? "" : category)}
                        className={`flex items-center justify-between w-full px-6 py-4 text-left transition-colors ${isExpanded ? color.light : "hover:bg-zinc-50/80"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                          <span className={`text-sm font-semibold ${isExpanded ? color.text : "text-zinc-700"}`}>{category}</span>
                          <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{categorySections.length}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 pt-1 grid grid-cols-2 gap-2">
                              {categorySections.map(([type, config]) => (
                                <button
                                  key={type}
                                  onClick={() => addSection(type)}
                                  className={`group flex items-start gap-3 p-3 rounded-xl border ${color.border} bg-white hover:shadow-md transition-all text-left`}
                                >
                                  <div className={`w-9 h-9 rounded-lg ${color.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <config.icon className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-zinc-800 block">{config.label}</span>
                                    <span className="text-[11px] text-zinc-400 leading-tight line-clamp-1">{config.description}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
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
