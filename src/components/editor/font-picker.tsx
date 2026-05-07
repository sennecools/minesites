"use client";

import { motion } from "framer-motion";
import { FONT_FAMILY_MAP, FONT_DISPLAY_NAMES } from "@/lib/theme-presets";
import type { FontKey } from "@/types/site-theme";

interface FontPickerProps {
  selected: FontKey;
  onChange: (key: FontKey) => void;
  accentColor: string; // hex string from THEME_PRESETS[activePalette] for active underline
}

export function FontPicker({ selected, onChange, accentColor }: FontPickerProps) {
  const keys = Object.keys(FONT_FAMILY_MAP) as FontKey[];

  return (
    <div className="flex flex-col gap-0.5">
      {keys.map((key) => (
        <motion.button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full text-left py-2 px-1 text-sm rounded transition-colors hover:bg-zinc-100"
          style={{
            fontFamily: FONT_FAMILY_MAP[key],
            fontWeight: selected === key ? 700 : 400,
            borderBottom: selected === key
              ? `2px solid ${accentColor}`
              : "2px solid transparent",
            color: selected === key ? "#18181b" : "#71717a",
          }}
        >
          {FONT_DISPLAY_NAMES[key]}
        </motion.button>
      ))}
    </div>
  );
}
