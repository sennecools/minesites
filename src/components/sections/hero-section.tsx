"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  title: string;
  subtitle?: string | null;
  settings: Record<string, unknown>;
}

/**
 * WR-06: validates a user-supplied background URL before embedding in a
 * CSS url() call. Mirrors `safeBackgroundUrl` in
 * src/components/sections/render/hero-render.tsx — only http(s) absolute
 * URLs pass. A settings value like
 *   "img.png\"); background-image: url(\"evil"
 * could otherwise break out of the CSS context and inject a different
 * background. This file is orphaned today (live renderer is HeroRender),
 * but the guard ensures a future contributor who wires this back up
 * inherits the same protection.
 */
function safeBackgroundUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return undefined;
    return url;
  } catch {
    return undefined;
  }
}

export function HeroSection({ title, subtitle, settings }: HeroSectionProps) {
  const heroSettings = (settings.hero as Record<string, unknown>) || {};
  const rawBackgroundImage = heroSettings.backgroundImage as string | undefined;
  const backgroundImage = rawBackgroundImage ? safeBackgroundUrl(rawBackgroundImage) : undefined;

  return (
    <section
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10" />
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-5xl font-bold tracking-tight sm:text-6xl ${
            backgroundImage ? "text-white" : "text-zinc-900"
          }`}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`mt-6 text-xl ${
              backgroundImage ? "text-white/90" : "text-zinc-600"
            }`}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
