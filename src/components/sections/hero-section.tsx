"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  title: string;
  subtitle?: string | null;
  settings: Record<string, unknown>;
}

export function HeroSection({ title, subtitle, settings }: HeroSectionProps) {
  const heroSettings = (settings.hero as Record<string, unknown>) || {};
  const backgroundImage = heroSettings.backgroundImage as string | undefined;

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
