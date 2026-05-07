"use client";

import { motion } from "framer-motion";
import { THEME_PRESETS, PALETTE_DISPLAY_NAMES } from "@/lib/theme-presets";
import type { PaletteKey } from "@/types/site-theme";

interface ColorSwatchPickerProps {
  selected: PaletteKey;
  onChange: (key: PaletteKey) => void;
}

export function ColorSwatchPicker({ selected, onChange }: ColorSwatchPickerProps) {
  const keys = Object.keys(THEME_PRESETS) as PaletteKey[];

  return (
    <div className="grid grid-cols-4 gap-1">
      {keys.map((key) => (
        // 44px interactive target (WCAG 2.5.5); 28px visual circle centered inside
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-label={PALETTE_DISPLAY_NAMES[key]}
          className="w-11 h-11 flex items-center justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={selected === key ? { scale: 1.1 } : { scale: 1.0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              backgroundColor: THEME_PRESETS[key],
              outline: selected === key ? `2px solid ${THEME_PRESETS[key]}` : "none",
              outlineOffset: "2px",
            }}
          />
        </button>
      ))}
    </div>
  );
}
