"use client";

import { THEME_PRESETS, FONT_FAMILY_MAP } from "@/lib/theme-presets";
import type { SiteTheme, PaletteKey, FontKey } from "@/types/site-theme";
import { Button } from "@/components/ui/button";
import { ColorSwatchPicker } from "@/components/editor/color-swatch-picker";
import { FontPicker } from "@/components/editor/font-picker";

interface AppearanceTabProps {
  themeSettings: SiteTheme;
  setThemeSettings: (theme: SiteTheme) => void;
  previewRootRef: React.RefObject<HTMLDivElement | null>;
  onSave: () => void;
  isSaving: boolean;
}

export function AppearanceTab({
  themeSettings,
  setThemeSettings,
  previewRootRef,
  onSave,
  isSaving,
}: AppearanceTabProps) {
  const handlePaletteChange = (key: PaletteKey) => {
    setThemeSettings({ ...themeSettings, palette: key });
    if (previewRootRef.current) {
      previewRootRef.current.style.setProperty("--site-accent", THEME_PRESETS[key]);
      previewRootRef.current.setAttribute("data-theme", key);
    }
  };

  const handleFontChange = (key: FontKey) => {
    setThemeSettings({ ...themeSettings, font: key });
    if (previewRootRef.current) {
      previewRootRef.current.style.setProperty("--site-font-display", FONT_FAMILY_MAP[key]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="settings-label">Color</label>
        <ColorSwatchPicker
          selected={themeSettings.palette}
          onChange={handlePaletteChange}
        />
      </div>

      <div>
        <label className="settings-label">Font</label>
        <FontPicker
          selected={themeSettings.font}
          onChange={handleFontChange}
          accentColor={THEME_PRESETS[themeSettings.palette]}
        />
      </div>

      <Button
        variant="primary"
        className="w-full mt-4"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Appearance"}
      </Button>
    </div>
  );
}
