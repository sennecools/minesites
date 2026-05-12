// Canonical home for all section settings types and shared component prop types.
// Per Phase 1 decisions D-06, D-07, D-08.

import type { Section, WebsiteData } from '@/components/preview/types';

// ---------- SectionType union ----------
// Excludes 'navbar' — navbar is server-level config (Server.navbar Json), not a Section row.
// This list mirrors the keys of `sectionTypeConfig` in page.tsx (line ~660+) minus 'navbar'.
export type SectionType =
  | 'hero'
  | 'stats'
  | 'features'
  | 'gamemodes'
  | 'discord'
  | 'gallery'
  | 'staff'
  | 'text'
  | 'rules'
  | 'voting'
  | 'store'
  | 'reviews'
  | 'faq'
  | 'video';

// ---------- ServerScopedSettings ----------
// Per Phase 7 D-10, D-11: server-specific section types (Live Player Count, Server Info,
// and any future server-scoped types) reference a connected MinecraftServer record by id
// stored as a top-level key inside `section.settings`. Future section settings interfaces
// extend or include this shape.
export interface ServerScopedSettings {
  minecraftServerId?: string;
}

// ---------- Hero (full definition, extracted from page.tsx lines 70-85) ----------
export interface HeroSettings {
  alignment?: 'left' | 'center' | 'right';
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
  playerBadge?: 'top' | 'bottom' | 'hidden';
  badgeStyle?: 'pill' | 'minimal' | 'card' | 'glow';
  showDiscordButton?: boolean;
  discordButtonText?: string;
  showCopyIpButton?: boolean;
  copyIpButtonText?: string;
}

// ---------- Stub interfaces for non-extracted section types ----------
// Shapes mirror current inline definitions in page.tsx so a future extraction
// (Phase 3) can replace the stub with the full interface without breakers.

export interface GamemodesSettings {
  layout?: 'single' | 'grid-2x2' | 'grid-4' | 'list';
  cardStyle?: 'default' | 'compact' | 'minimal';
  alignment?: 'left' | 'center' | 'right';
  headerAlignment?: 'left' | 'center' | 'right';
  backgroundType?: 'solid' | 'gradient' | 'image';
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
}

export interface FeaturesSettings {
  layout?: '2x1' | '2x2';
  headerAlignment?: 'left' | 'center' | 'right';
  cardAlignment?: 'left' | 'center' | 'right';
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
}

export interface DiscordSettings {
  layout?: 'default' | 'card-left' | 'centered' | 'compact';
  alignment?: 'left' | 'center' | 'right';
  backgroundType?: 'solid' | 'gradient' | 'image';
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
}

export interface GallerySettings {
  layout?: 'bento' | 'grid' | 'masonry';
  columns?: 2 | 3 | 4;
  images?: Array<{ id: string; url: string; label?: string }>;
  showLabels?: boolean;
  headerAlignment?: 'left' | 'center' | 'right';
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
}

export interface StatsSettings {
  mode?: 'single' | 'network';
  servers?: Array<{
    id: string;
    name: string;
    address?: string;
    players?: number;
    maxPlayers?: number;
    status?: 'online' | 'offline';
  }>;
  layout?: 'grid' | 'list' | 'compact';
  showTotal?: boolean;
  showVersion?: boolean;
  showUptime?: boolean;
  version?: string;
  uptime?: string;
  headerAlignment?: 'left' | 'center' | 'right';
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
}

export interface StaffMemberSettings {
  username: string;
  role: string;
  roleColor: string;
}

export interface StaffSettings {
  layout?: 'grid' | 'list' | 'compact';
  members?: StaffMemberSettings[];
  showOnlineStatus?: boolean;
  headerAlignment?: 'left' | 'center' | 'right';
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
}

export interface TextSettings {
  content?: string;
  alignment?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium' | 'large';
  backgroundType?: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  backgroundImage?: string;
  imageBlur?: number;
  imageDarken?: number;
}

// ---------- Wrapper applied to Section.settings ----------
// Per the on-disk shape in the database: `section.settings.hero`, `section.settings.gamemodes`, etc.
export interface SectionSettings {
  [key: string]: unknown;
  alignment?: 'left' | 'center' | 'right';
  layout?: 'grid' | 'list' | 'cards';
  colorScheme?: 'default' | 'dark' | 'accent'; // Legacy — retained for stub compatibility
  showBackground?: boolean;
  content?: {
    features?: Array<{ title: string; description: string; icon: string }>;
    modes?: string[];
    [key: string]: unknown;
  };
  hero?: HeroSettings;
  gamemodes?: GamemodesSettings;
  features?: FeaturesSettings;
  discord?: DiscordSettings;
  stats?: StatsSettings;
  gallery?: GallerySettings;
  staff?: StaffSettings;
  text?: TextSettings;
}

// ---------- Shared component prop interfaces ----------
// These live HERE (NOT in section-registry.tsx) to prevent the circular import
// pitfall described in RESEARCH §Pitfall 2.
export interface SectionRenderProps {
  section: Section;
  serverData: WebsiteData;
}

export interface SectionSettingsProps {
  section: Section;
  onUpdate: (updates: Partial<Section>) => void;
}
