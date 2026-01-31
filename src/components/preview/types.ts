// Shared types for preview components

export interface ServerData {
  name: string;
  subdomain: string;
  serverIp: string | null;
  players?: number;
  maxPlayers?: number;
  version?: string;
}

export interface Section {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  settings: Record<string, unknown>;
  visible: boolean;
}

export interface StatsServer {
  id: string;
  name: string;
  address?: string;
  players?: number;
  maxPlayers?: number;
  status?: "online" | "offline";
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  label?: string;
}

// Utility function to check if a color is dark
export function isColorDark(hex: string): boolean {
  if (!hex) return false;
  const c = hex.replace("#", "");
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// Helper to determine if a color is light
export function isLightColor(hex: string): boolean {
  if (!hex) return true;
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
