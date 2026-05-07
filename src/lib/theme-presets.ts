// Static theme data for Phase 2 Theme System.
// Used by: [subdomain]/layout.tsx (SSR injection), AppearanceTab (editor live preview).
// All values are per D-05 (accent hex) and D-08/D-09 (font keys).

import type { PaletteKey, FontKey } from "@/types/site-theme";

/**
 * Maps palette key → accent hex color.
 * These are the ONLY accent values; background, card, and text are fixed (D-04).
 */
export const THEME_PRESETS: Record<PaletteKey, string> = {
  cyan:    "#06b6d4",
  emerald: "#10b981",
  violet:  "#8b5cf6",
  orange:  "#f97316",
  red:     "#ef4444",
  gold:    "#eab308",
  pink:    "#ec4899",
  white:   "#f4f4f5",
};

/**
 * Maps font key → CSS font-family string suitable for the --site-font-display CSS variable.
 * Uses literal font-family names (not var(--font-*)) so it works in both the subdomain
 * layout (where next/font/google CSS vars are available) and the editor preview panel
 * (where they are NOT — see RESEARCH.md Pitfall 5).
 */
export const FONT_FAMILY_MAP: Record<FontKey, string> = {
  rajdhani: "'Rajdhani', sans-serif",
  orbitron: "'Orbitron', sans-serif",
  cinzel:   "'Cinzel', serif",
  exo2:     "'Exo 2', sans-serif",
  bebas:    "'Bebas Neue', sans-serif",
};

/**
 * Human-readable display names for font picker labels.
 */
export const FONT_DISPLAY_NAMES: Record<FontKey, string> = {
  rajdhani: "Rajdhani",
  orbitron: "Orbitron",
  cinzel:   "Cinzel",
  exo2:     "Exo 2",
  bebas:    "Bebas Neue",
};

/**
 * Human-readable display names for palette swatches (used as aria-labels).
 */
export const PALETTE_DISPLAY_NAMES: Record<PaletteKey, string> = {
  cyan:    "Cyan",
  emerald: "Emerald",
  violet:  "Violet",
  orange:  "Orange",
  red:     "Red",
  gold:    "Gold",
  pink:    "Pink",
  white:   "White",
};
