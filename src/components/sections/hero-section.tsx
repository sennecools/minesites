"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui";

interface HeroSectionProps {
  title: string;
  subtitle?: string | null;
  settings: Record<string, unknown>;
  serverIp?: string | null;
}

export function HeroSection({ title, subtitle, settings, serverIp }: HeroSectionProps) {
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

        {serverIp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <div className="inline-flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3">
              <span className={backgroundImage ? "text-white/70" : "text-zinc-500"}>
                Server IP:
              </span>
              <span className={`font-mono font-semibold ${backgroundImage ? "text-white" : "text-zinc-900"}`}>
                {serverIp}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(serverIp)}
                className={backgroundImage ? "text-white hover:text-white/80" : ""}
              >
                Copy
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
