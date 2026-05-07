"use client";

import type { HeroSettings, SectionRenderProps } from '@/types/sections';
import { isLightColor } from '@/components/preview/types';

/**
 * HeroRender — extracted from preview-client.tsx PreviewHero (Phase 1).
 * Same markup, same behavior. Player count now sourced from serverData prop.
 *
 * Per Phase 1 decision D-04 (Hero only) and D-08 (Section/ServerData come from preview/types).
 */
export function HeroRender({ section, serverData }: SectionRenderProps) {
  const hero = (section.settings.hero as HeroSettings) ?? {};
  // Section-level background override (THEME-03) — takes precedence over hero background type
  const sectionBgOverride = section.settings.backgroundColor as string | undefined;
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

  const hasImage = backgroundType === "image" && !!backgroundImage;
  const isLight = backgroundType === "solid" ? isLightColor(backgroundColor) : !hasImage;
  const isDark = hasImage || !isLight;
  const players = serverData.players ?? 0;

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor };
    if (backgroundType === "gradient")
      return { background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const PlayerBadge = () => {
    if (badgeStyle === "minimal") {
      return (
        <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${isDark ? "text-white/90" : "text-zinc-600"}`}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold">{players}</span> online
        </div>
      );
    }
    if (badgeStyle === "card") {
      return (
        <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${isDark ? "bg-white/10 backdrop-blur-md text-white border border-white/10" : "bg-white text-zinc-700 shadow-lg border border-zinc-100"}`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
            <span className="font-bold text-lg">{players}</span>
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
          <div className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isDark ? "bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm" : "bg-green-50 text-green-700 border border-green-200"}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
            <span className="font-bold">{players}</span>
            <span className={isDark ? "text-green-300/70" : "text-green-600"}>players online</span>
          </div>
        </div>
      );
    }
    // default: pill
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? "bg-white/10 backdrop-blur-sm text-white border border-white/20" : "bg-white text-zinc-600 shadow-sm border border-zinc-200"}`}>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {players} players online
      </div>
    );
  };

  return (
    <div
      className="relative overflow-hidden"
      style={sectionBgOverride ? { backgroundColor: sectionBgOverride } : getBackgroundStyle()}
    >
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
          <div className="absolute inset-0 bg-black" style={{ opacity: imageDarken / 100 }} />
        </>
      )}
      {!hasImage && backgroundType === "gradient" && (
        <>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        </>
      )}
      <div
        className={`relative py-20 px-6 ${
          alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          {playerBadge === "top" && (
            <div className="mb-6">
              <PlayerBadge />
            </div>
          )}
          <h1 className={`text-5xl md:text-6xl font-extrabold mb-4 tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || serverData.name}
          </h1>
          <p
            className={`text-xl max-w-2xl mb-8 ${
              alignment === "center" ? "mx-auto" : alignment === "right" ? "ml-auto" : ""
            } ${isDark ? "text-white/80" : "text-zinc-600"}`}
          >
            {section.subtitle}
          </p>
          {playerBadge === "bottom" && (
            <div className="mb-6">
              <PlayerBadge />
            </div>
          )}
          {(showDiscordButton || showCopyIpButton) && (
            <div
              className={`flex gap-3 ${
                alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : ""
              }`}
            >
              {showDiscordButton && (
                <button className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 hover:-translate-y-0.5 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200">
                  {discordButtonText}
                </button>
              )}
              {showCopyIpButton && (
                <button
                  className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 ${
                    isDark
                      ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10"
                      : "bg-white hover:bg-zinc-50 text-zinc-700 shadow-sm border border-zinc-200 hover:shadow-md"
                  }`}
                >
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
