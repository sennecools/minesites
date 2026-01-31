"use client";

import {
  Users,
  Server,
  Zap,
  BarChart3,
  Shield,
  Star,
  Globe,
  Heart,
  Rocket,
  Sparkles,
  MessageCircle,
  ChevronRight,
  Maximize2,
  Image,
  Trophy,
} from "lucide-react";

// Types
interface Section {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  settings: Record<string, unknown>;
  visible: boolean;
}

interface ServerData {
  name: string;
  subdomain: string;
  serverIp: string | null;
}

interface StatsServer {
  id: string;
  name: string;
  players?: number;
  maxPlayers?: number;
  status?: "online" | "offline";
}

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

interface GalleryImage {
  id: string;
  url: string;
  label?: string;
}

// Mock data for preview
const mockData = {
  players: 247,
  maxPlayers: 500,
  version: "1.20.4",
};

// Utility functions
function isColorDark(hex: string): boolean {
  if (!hex) return false;
  const c = hex.replace("#", "");
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

function isLightColor(hex: string): boolean {
  if (!hex) return true;
  const c = hex.replace("#", "");
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

// Icon map
const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  shield: Shield,
  users: Users,
  star: Star,
  server: Server,
  globe: Globe,
  heart: Heart,
  trophy: Trophy,
  rocket: Rocket,
  sparkles: Sparkles,
};

const iconGradients = [
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-indigo-500 to-purple-600",
  "from-cyan-500 to-blue-600",
];

// Preview Components
function PreviewHero({ section, serverData }: { section: Section; serverData: ServerData }) {
  const hero = (section.settings.hero as Record<string, unknown>) || {};
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
  } = hero as Record<string, unknown>;

  const hasImage = backgroundType === "image" && !!backgroundImage;
  const isLight = backgroundType === "solid" ? isLightColor(backgroundColor as string) : !hasImage;
  const isDark = hasImage || !isLight;

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor: backgroundColor as string };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const PlayerBadge = () => {
    if (badgeStyle === "minimal") {
      return (
        <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${isDark ? "text-white/90" : "text-zinc-600"}`}>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold">{mockData.players}</span> online
        </div>
      );
    }
    if (badgeStyle === "card") {
      return (
        <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${isDark ? "bg-white/10 backdrop-blur-md text-white border border-white/10" : "bg-white text-zinc-700 shadow-lg border border-zinc-100"}`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
            <span className="font-bold text-lg">{mockData.players}</span>
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
            <span className="font-bold">{mockData.players}</span>
            <span className={isDark ? "text-green-300/70" : "text-green-600"}>players online</span>
          </div>
        </div>
      );
    }
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? "bg-white/10 backdrop-blur-sm text-white border border-white/20" : "bg-white text-zinc-600 shadow-sm border border-zinc-200"}`}>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {mockData.players} players online
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden" style={getBackgroundStyle()}>
      {hasImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, filter: (imageBlur as number) > 0 ? `blur(${imageBlur}px)` : undefined, transform: (imageBlur as number) > 0 ? "scale(1.1)" : undefined }} />
          <div className="absolute inset-0 bg-black" style={{ opacity: (imageDarken as number) / 100 }} />
        </>
      )}
      {!hasImage && backgroundType === "gradient" && (
        <>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        </>
      )}
      <div className={`relative py-20 px-6 ${alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left"}`}>
        <div className="max-w-3xl mx-auto">
          {playerBadge === "top" && <div className="mb-6"><PlayerBadge /></div>}
          <h1 className={`text-5xl md:text-6xl font-extrabold mb-4 tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || serverData.name}
          </h1>
          <p className={`text-xl max-w-2xl mb-8 ${alignment === "center" ? "mx-auto" : alignment === "right" ? "ml-auto" : ""} ${isDark ? "text-white/80" : "text-zinc-600"}`}>
            {section.subtitle}
          </p>
          {playerBadge === "bottom" && <div className="mb-6"><PlayerBadge /></div>}
          {(!!showDiscordButton || !!showCopyIpButton) && (
            <div className={`flex gap-3 ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : ""}`}>
              {!!showDiscordButton && (
                <button className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 hover:-translate-y-0.5 text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200">
                  {discordButtonText as string}
                </button>
              )}
              {!!showCopyIpButton && (
                <button className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 ${isDark ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10" : "bg-white hover:bg-zinc-50 text-zinc-700 shadow-sm border border-zinc-200 hover:shadow-md"}`}>
                  {copyIpButtonText as string}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewStats({ section }: { section: Section }) {
  const stats = (section.settings.stats as Record<string, unknown>) || {};
  const {
    mode = "single",
    servers = [],
    layout = "grid",
    showTotal = true,
    showVersion = true,
    showUptime = true,
    version = mockData.version,
    uptime = "99.9%",
    backgroundType = "solid",
    backgroundColor = "#18181b",
    gradientFrom = "#18181b",
    gradientTo = "#27272a",
    headerAlignment = "center",
  } = stats;

  const isDark = (backgroundType === "solid" && isColorDark(backgroundColor as string)) ||
    (backgroundType === "gradient" && isColorDark(gradientFrom as string));

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor: backgroundColor as string };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const displayServers: StatsServer[] = (servers as StatsServer[]).length > 0 ? servers as StatsServer[] : [
    { id: "1", name: "Survival", players: 45, maxPlayers: 100, status: "online" },
    { id: "2", name: "Skyblock", players: 32, maxPlayers: 50, status: "online" },
    { id: "3", name: "Prison", players: 28, maxPlayers: 75, status: "online" },
  ];

  const totalPlayers = displayServers.reduce((sum, s) => sum + (s.players || 0), 0);
  const totalMaxPlayers = displayServers.reduce((sum, s) => sum + (s.maxPlayers || 0), 0);

  if (mode === "single") {
    const statItems = [
      { value: mockData.players.toString(), label: "Players Online", icon: Users, color: "text-green-500", iconBg: "bg-green-500/10" },
      { value: mockData.maxPlayers.toString(), label: "Server Capacity", icon: Server, color: isDark ? "text-cyan-400" : "text-cyan-600", iconBg: "bg-cyan-500/10" },
      ...(showVersion ? [{ value: version as string, label: "Minecraft Version", icon: Zap, color: isDark ? "text-amber-400" : "text-amber-600", iconBg: "bg-amber-500/10" }] : []),
      ...(showUptime ? [{ value: uptime as string, label: "Uptime", icon: BarChart3, color: isDark ? "text-indigo-400" : "text-indigo-600", iconBg: "bg-indigo-500/10" }] : []),
    ];

    return (
      <div className="relative py-12 px-6 overflow-hidden" style={getBackgroundStyle()}>
        <div className="relative max-w-5xl mx-auto">
          {section.title && (
            <div className={`mb-8 ${headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left"}`}>
              <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                {section.title}
              </h2>
            </div>
          )}
          <div className={`${layout === "compact" ? "flex items-center justify-center gap-12 flex-wrap" : "grid grid-cols-2 md:grid-cols-4 gap-6"}`}>
            {statItems.map((stat, i) => (
              <div key={i} className={`${layout === "compact" ? "text-center" : "text-center py-6 px-4 rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:-translate-y-1"} ${layout !== "compact" ? (isDark ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10" : "bg-white/80 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg shadow-sm") : ""}`}>
                {layout !== "compact" && (
                  <div className={`w-14 h-14 rounded-xl ${stat.iconBg} flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                )}
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className={`text-sm mt-1 font-medium ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-12 px-6 overflow-hidden" style={getBackgroundStyle()}>
      <div className="relative max-w-5xl mx-auto">
        <div className={`mb-8 ${headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left"}`}>
          {section.title && <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>{section.title}</h2>}
          {!!showTotal && (
            <div className={`flex items-center gap-2 ${headerAlignment === "center" ? "justify-center" : headerAlignment === "right" ? "justify-end" : "justify-start"}`}>
              <span className="text-4xl font-bold text-green-500">{totalPlayers}</span>
              <span className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>/ {totalMaxPlayers} players online</span>
            </div>
          )}
        </div>
        <div className={`${layout === "list" ? "space-y-3 max-w-2xl mx-auto" : "grid grid-cols-1 md:grid-cols-3 gap-4"}`}>
          {displayServers.map((server) => (
            <div key={server.id} className={`${layout === "list" ? "flex items-center justify-between px-5 py-4 hover:scale-[1.01]" : "p-5 hover:scale-[1.02] hover:-translate-y-1"} rounded-xl transition-all duration-200 cursor-pointer ${isDark ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10" : "bg-white/80 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg shadow-sm"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${server.status === "online" ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{server.name}</span>
              </div>
              <div className={layout === "list" ? "flex items-center gap-4" : "mt-3"}>
                <div className={layout === "list" ? "" : "mb-3"}>
                  <span className="text-2xl font-bold text-green-500">{server.players || 0}</span>
                  <span className={`text-lg ${isDark ? "text-zinc-500" : "text-zinc-400"}`}> / {server.maxPlayers || 0}</span>
                </div>
                <div className={`${layout === "list" ? "w-24" : "w-full"} h-2 rounded-full overflow-hidden ${isDark ? "bg-zinc-700" : "bg-zinc-200"}`}>
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${((server.players || 0) / (server.maxPlayers || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreviewFeatures({ section }: { section: Section }) {
  const rawFeatures = (section.settings.content as Record<string, unknown>)?.features;
  const features: FeatureItem[] = Array.isArray(rawFeatures)
    ? rawFeatures.map((f, i) => typeof f === 'string' ? { title: f, description: "", icon: ["zap", "shield", "users", "star"][i] || "zap" } : f as FeatureItem)
    : [
        { title: "Fast Performance", description: "Optimized servers with minimal lag", icon: "zap" },
        { title: "Anti-Cheat", description: "Advanced anti-cheat protection", icon: "shield" },
        { title: "Active Community", description: "Join our Discord community", icon: "users" },
        { title: "24/7 Uptime", description: "Always online servers", icon: "star" },
      ];

  const featuresSettings = (section.settings.features as Record<string, unknown>) || {};
  const { layout = "2x2", headerAlignment = "center", cardAlignment = "left", backgroundType = "gradient", backgroundColor = "#ffffff", gradientFrom = "#ffffff", gradientTo = "#f4f4f5" } = featuresSettings;

  const isDark = (backgroundType === "solid" && isColorDark(backgroundColor as string)) || (backgroundType === "gradient" && isColorDark(gradientFrom as string));
  const featureCount = layout === "2x1" ? 2 : 4;

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor: backgroundColor as string };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  return (
    <div className="relative py-16 px-6 overflow-hidden" style={getBackgroundStyle()}>
      <div className="relative max-w-5xl mx-auto">
        <div className={`mb-12 ${headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left"}`}>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>{section.title || "Why Join Us?"}</h2>
          {section.subtitle && <p className={`text-lg max-w-2xl ${headerAlignment === "center" ? "mx-auto" : headerAlignment === "right" ? "ml-auto" : ""} ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{section.subtitle}</p>}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.slice(0, featureCount).map((feature, i) => {
            const Icon = featureIcons[feature.icon] || Zap;
            const gradient = iconGradients[i % iconGradients.length];
            return (
              <div key={i} className={`feature-card p-6 rounded-2xl flex flex-col transition-all duration-200 cursor-pointer hover:-translate-y-1 ${cardAlignment === "center" ? "text-center items-center" : cardAlignment === "right" ? "text-right items-end" : "text-left items-start"} ${isDark ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10" : "bg-white/80 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg shadow-sm"}`}>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg icon-wiggle`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`font-bold text-xl mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>{feature.title}</h3>
                {feature.description && <p className={`text-base ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{feature.description}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewGamemodes({ section }: { section: Section }) {
  const modes = ((section.settings.content as Record<string, unknown>)?.modes as string[]) || ["Survival", "Skyblock", "Prison", "KitPvP"];
  const gamemodesSettings = (section.settings.gamemodes as Record<string, unknown>) || {};
  const {
    layout = "grid-2x2",
    backgroundType = "solid",
    backgroundColor = "#fafafa",
    gradientFrom = "#fafafa",
    gradientTo = "#f4f4f5",
    showPlayerCount = true,
    showBadge = true,
    showModpack = true,
    showDescription = true,
    headerAlignment = "center",
  } = gamemodesSettings;

  const isDark = (backgroundType === "solid" && isColorDark(backgroundColor as string)) || (backgroundType === "gradient" && isColorDark(gradientFrom as string));

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor: backgroundColor as string };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const serverData = [
    { modpack: "ATM10", desc: "Endless tech, magic, and chaos.", players: 4, isPopular: true, gradient: "from-emerald-400 via-cyan-500 to-blue-600", bannerPattern: true },
    { modpack: "MoniFactory", desc: "Factory-focused modpack.", players: 0, isClosed: true, gradient: "from-violet-500 via-purple-500 to-fuchsia-600", bannerPattern: false },
    { modpack: "Custom Pack", desc: "Our curated experience.", players: 12, gradient: "from-amber-400 via-orange-500 to-red-500", bannerPattern: true },
    { modpack: "Vanilla+", desc: "Enhanced vanilla.", players: 8, gradient: "from-rose-400 via-pink-500 to-purple-500", bannerPattern: false },
  ];

  const displayModes = layout === "single" ? modes.slice(0, 1) : modes.slice(0, 4);

  const gridClass = layout === "single"
    ? "max-w-2xl mx-auto"
    : layout === "grid-4"
      ? "grid grid-cols-2 lg:grid-cols-4 gap-4"
      : layout === "list"
        ? "flex flex-col gap-3"
        : "grid md:grid-cols-2 gap-5";

  return (
    <div className="relative py-16 px-6 overflow-hidden" style={getBackgroundStyle()}>
      <div className="relative max-w-5xl mx-auto">
        <div className={`mb-10 ${headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left"}`}>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>{section.title || "Active Servers"}</h2>
          {section.subtitle && <p className={isDark ? "text-zinc-300" : "text-zinc-600"}>{section.subtitle}</p>}
        </div>
        <div className={gridClass}>
          {displayModes.map((mode, i) => {
            const data = serverData[i] || serverData[0];

            // Single layout - large featured card
            if (layout === "single") {
              return (
                <div key={i} className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 ${isDark ? "bg-white/5 border border-white/10 hover:border-white/20" : "bg-white shadow-md hover:shadow-xl border border-zinc-200 hover:border-zinc-300"}`}>
                  <div className={`relative aspect-[2.5/1] bg-gradient-to-br ${data.gradient}`}>
                    {data.bannerPattern && (
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '12px 12px' }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {!!showBadge && data.isPopular && (
                      <span className="absolute top-4 right-4 text-sm font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-current" /> Popular
                      </span>
                    )}
                    {!!showPlayerCount && !data.isClosed && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white font-medium">{data.players} online</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className={`text-2xl font-bold group-hover:text-indigo-600 transition-colors ${isDark ? "text-white" : "text-zinc-900"}`}>{mode}</h3>
                    {!!showModpack && <p className={`text-base ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{data.modpack}</p>}
                    {!!showDescription && <p className={`text-base mt-3 mb-5 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{data.desc}</p>}
                    <button className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${isDark ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-cyan-200/50"}`}>
                      Join Server <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            // List layout - horizontal card
            if (layout === "list") {
              return (
                <div key={i} className={`group flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] ${isDark ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10" : "bg-white shadow-sm hover:shadow-lg border border-zinc-200 hover:border-zinc-300"}`}>
                  <div className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${data.gradient}`}>
                    {data.bannerPattern && (
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '8px 8px' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold group-hover:text-indigo-600 transition-colors truncate ${isDark ? "text-white" : "text-zinc-900"}`}>{mode}</h3>
                    {!!showModpack && <p className={`text-sm truncate ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{data.modpack}</p>}
                  </div>
                  {!!showPlayerCount && !data.isClosed && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className={isDark ? "text-zinc-400" : "text-zinc-500"}>{data.players}</span>
                    </div>
                  )}
                  {!!showBadge && data.isClosed && (
                    <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded">Closed</span>
                  )}
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isDark ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"}`}>
                    Join <ChevronRight className="w-3 h-3 inline" />
                  </button>
                </div>
              );
            }

            // Default grid layouts (grid-2x2 and grid-4)
            return (
              <div key={i} className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 ${isDark ? "bg-white/5 border border-white/10 hover:border-white/20" : "bg-white shadow-md hover:shadow-xl border border-zinc-200 hover:border-zinc-300"}`}>
                <div className={`relative ${layout === "grid-4" ? "aspect-[2.5/1]" : "aspect-[2/1]"} bg-gradient-to-br ${data.gradient}`}>
                  {data.bannerPattern && (
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '10px 10px' }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {!!showBadge && data.isPopular && (
                    <span className={`absolute top-2 right-2 font-bold bg-indigo-600 text-white rounded-lg shadow-lg flex items-center gap-1 ${layout === "grid-4" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"}`}>
                      <Star className={`${layout === "grid-4" ? "w-2.5 h-2.5" : "w-3 h-3"} fill-current`} /> Popular
                    </span>
                  )}
                  {!!showBadge && data.isClosed && (
                    <span className={`absolute top-2 right-2 font-bold bg-red-600 text-white rounded-lg ${layout === "grid-4" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"}`}>Closed</span>
                  )}
                  {!!showPlayerCount && !data.isClosed && (
                    <div className={`absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg ${layout === "grid-4" ? "px-2 py-1" : "px-2.5 py-1.5"}`}>
                      <span className={`rounded-full bg-green-500 animate-pulse ${layout === "grid-4" ? "w-1.5 h-1.5" : "w-2 h-2"}`} />
                      <span className={`text-white font-medium ${layout === "grid-4" ? "text-[10px]" : "text-xs"}`}>{data.players} online</span>
                    </div>
                  )}
                </div>
                <div className={layout === "grid-4" ? "p-3" : "p-4"}>
                  <h3 className={`${layout === "grid-4" ? "text-sm" : "text-lg"} font-bold group-hover:text-indigo-600 transition-colors ${isDark ? "text-white" : "text-zinc-900"}`}>{mode}</h3>
                  {!!showModpack && <p className={`${layout === "grid-4" ? "text-xs" : "text-sm"} ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{data.modpack}</p>}
                  <button className={`w-full mt-3 flex items-center justify-center gap-1 rounded-xl font-medium transition-all ${layout === "grid-4" ? "px-2 py-1.5 text-xs" : "px-4 py-2.5 text-sm"} ${isDark ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-cyan-200/50"}`}>
                    Join <ChevronRight className={layout === "grid-4" ? "w-3 h-3" : "w-4 h-4"} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewDiscord({ section, serverData }: { section: Section; serverData: ServerData }) {
  const discordSettings = (section.settings.discord as Record<string, unknown>) || {};
  const { layout = "default", alignment = "left", backgroundType = "gradient", backgroundColor = "#eef2ff", gradientFrom = "#eef2ff", gradientTo = "#faf5ff", showBadge = true, showStats = true, memberCount, onlineCount, buttonText = "Join Server", guildName, guildIcon } = discordSettings;

  const isDark = (backgroundType === "solid" && isColorDark(backgroundColor as string));
  const formatCount = (count?: unknown) => {
    if (!count) return "—";
    const num = count as number;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor: backgroundColor as string };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const DiscordCard = () => (
    <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#2b2d31] w-full max-w-sm">
      <div className="relative h-24 bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="absolute -bottom-6 left-4">
          {guildIcon ? (
            <img src={guildIcon as string} alt="" className="w-14 h-14 rounded-2xl border-4 border-[#2b2d31] object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 border-4 border-[#2b2d31] flex items-center justify-center">
              <span className="text-white font-bold text-lg">{((guildName as string) || serverData.name).charAt(0)}</span>
            </div>
          )}
        </div>
      </div>
      <div className="pt-8 pb-4 px-4">
        <h3 className="text-white font-bold text-lg">{(guildName as string) || serverData.name}</h3>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {formatCount(onlineCount)} Online
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            {formatCount(memberCount)} Members
          </span>
        </div>
        <button className="w-full mt-4 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-sm font-medium transition-colors">
          {buttonText as string}
        </button>
      </div>
    </div>
  );

  if (layout === "compact") {
    return (
      <div className="relative py-10 px-6 overflow-hidden" style={getBackgroundStyle()}>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{section.title || "Join Our Discord"}</h2>
                {!!showStats && !!(memberCount || onlineCount) && (
                  <p className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>{formatCount(memberCount)} members · {formatCount(onlineCount)} online</p>
                )}
              </div>
            </div>
            <button className="px-6 py-3 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-xl font-medium transition-colors flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {buttonText as string}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const textAlignClass = alignment === "center" ? "text-center md:text-center" : alignment === "right" ? "text-center md:text-right" : "text-center md:text-left";
  const justifyClass = alignment === "center" ? "justify-center md:justify-center" : alignment === "right" ? "justify-center md:justify-end" : "justify-center md:justify-start";
  const flexDirection = layout === "card-left" ? "md:flex-row-reverse" : "md:flex-row";

  return (
    <div className="relative py-16 px-6 overflow-hidden" style={getBackgroundStyle()}>
      <div className="relative max-w-5xl mx-auto">
        <div className={`flex flex-col ${flexDirection} gap-10 items-center`}>
          <div className={`flex-1 ${textAlignClass}`}>
            {!!showBadge && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                <MessageCircle className="w-3.5 h-3.5" />
                Community
              </div>
            )}
            <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>{section.title || "Join Our Discord"}</h2>
            {section.subtitle && <p className={`text-lg mb-6 ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>{section.subtitle}</p>}
            {!!showStats && !!(memberCount || onlineCount) && (
              <div className={`flex items-center gap-6 ${justifyClass}`}>
                <div><div className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{formatCount(memberCount)}</div><div className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Members</div></div>
                <div className={`w-px h-10 ${isDark ? "bg-zinc-600" : "bg-zinc-200"}`} />
                <div><div className="text-2xl font-bold text-green-500">{formatCount(onlineCount)}</div><div className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Online</div></div>
              </div>
            )}
          </div>
          <DiscordCard />
        </div>
      </div>
    </div>
  );
}

function PreviewGallery({ section }: { section: Section }) {
  const gallerySettings = (section.settings.gallery as Record<string, unknown>) || {};
  const { layout = "bento", columns = 3, images = [], showLabels = true, backgroundType = "solid", backgroundColor = "#ffffff", gradientFrom = "#ffffff", gradientTo = "#f4f4f5", headerAlignment = "center" } = gallerySettings;

  const isDark = (backgroundType === "solid" && isColorDark(backgroundColor as string)) || (backgroundType === "gradient" && isColorDark(gradientFrom as string));

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor: backgroundColor as string };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const placeholderImages: GalleryImage[] = [
    { id: "1", url: "", label: "Spawn Area" },
    { id: "2", url: "", label: "PvP Arena" },
    { id: "3", url: "", label: "Shop District" },
    { id: "4", url: "", label: "Event Hall" },
  ];

  const placeholderGradients = ["from-emerald-400 via-cyan-500 to-blue-600", "from-violet-400 via-purple-500 to-fuchsia-600", "from-amber-400 via-orange-500 to-red-500", "from-rose-400 via-pink-500 to-purple-500"];
  const displayImages = (images as GalleryImage[]).length > 0 ? images as GalleryImage[] : placeholderImages;

  const renderImageCard = (img: GalleryImage, index: number, extraClasses = "") => {
    const isPlaceholder = !img.url;
    const gradient = placeholderGradients[index % placeholderGradients.length];

    return (
      <div key={img.id} className={`relative rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${extraClasses}`}>
        {isPlaceholder ? (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.2'%3E%3Cpath d='M5 0h1L0 5V4L4 0H5zm1 5v1H5L6 5zm-6 0l.5-.5L1 5H0zm0-5h.5L0 .5V0z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        ) : (
          <img src={img.url} alt={img.label || ""} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        {!!showLabels && img.label && (
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <h3 className="text-white font-bold text-lg drop-shadow-lg">{img.label}</h3>
              <p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity">Click to view</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  };

  const colsClass = columns === 2 ? "columns-2" : columns === 4 ? "columns-2 md:columns-4" : "columns-2 md:columns-3";

  return (
    <div className="relative py-16 px-6 overflow-hidden" style={getBackgroundStyle()}>
      <div className="relative max-w-5xl mx-auto">
        <div className={`mb-10 ${headerAlignment === "center" ? "text-center" : headerAlignment === "right" ? "text-right" : "text-left"}`}>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>{section.title || "Screenshots"}</h2>
          {section.subtitle && <p className={isDark ? "text-zinc-300" : "text-zinc-600"}>{section.subtitle}</p>}
        </div>

        {/* Bento layout - mixed sizes */}
        {layout === "bento" && (
          <div className="grid grid-cols-3 gap-3">
            {displayImages.slice(0, 4).map((img, i) => renderImageCard(img, i, i === 0 || i === 3 ? "col-span-2 aspect-[2/1]" : "aspect-square"))}
          </div>
        )}

        {/* Grid layout - uniform sizes */}
        {layout === "grid" && (
          <div className={`grid gap-3 ${columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}>
            {displayImages.map((img, i) => renderImageCard(img, i, "aspect-video"))}
          </div>
        )}

        {/* Masonry layout - alternating heights */}
        {layout === "masonry" && (
          <div className={`${colsClass} gap-3 space-y-3`}>
            {displayImages.map((img, i) => (
              <div key={img.id} className="break-inside-avoid">
                {renderImageCard(img, i, i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-video")}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StaffMember {
  username: string;
  role: string;
  roleColor: string;
}

function PreviewStaff({ section }: { section: Section }) {
  const staffSettings = (section.settings.staff as Record<string, unknown>) || {};
  const {
    layout = "grid",
    backgroundType = "solid",
    backgroundColor = "#fafafa",
    gradientFrom = "#fafafa",
    gradientTo = "#f4f4f5",
    showOnlineStatus = true,
    headerAlignment = "center",
    members = [],
  } = staffSettings;

  const isDark = (backgroundType === "solid" && isColorDark(backgroundColor as string)) ||
    (backgroundType === "gradient" && isColorDark(gradientFrom as string));

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor: backgroundColor as string };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const alignmentClass = headerAlignment === "left" ? "text-left" : headerAlignment === "right" ? "text-right" : "text-center";

  const roleColors: Record<string, string> = {
    red: "text-red-500", orange: "text-orange-500", amber: "text-amber-500",
    yellow: "text-yellow-500", lime: "text-lime-500", green: "text-green-500",
    emerald: "text-emerald-500", teal: "text-teal-500", cyan: "text-cyan-500",
    sky: "text-sky-500", blue: "text-blue-500", indigo: "text-indigo-500",
    violet: "text-violet-500", purple: "text-purple-500", fuchsia: "text-fuchsia-500",
    pink: "text-pink-500", rose: "text-rose-500",
  };

  const defaultStaff: StaffMember[] = [
    { username: "Notch", role: "Owner", roleColor: "red" },
    { username: "jeb_", role: "Admin", roleColor: "indigo" },
    { username: "Dinnerbone", role: "Moderator", roleColor: "emerald" },
    { username: "MHF_Steve", role: "Helper", roleColor: "cyan" },
  ];

  const displayStaff = (members as StaffMember[]).length > 0 ? members as StaffMember[] : defaultStaff;

  const gridClass = layout === "list"
    ? "flex flex-col gap-3 max-w-2xl mx-auto"
    : layout === "compact"
      ? "flex flex-wrap justify-center gap-6"
      : "grid grid-cols-2 sm:grid-cols-4 gap-5";

  return (
    <div className="relative py-14 px-6 overflow-hidden" style={getBackgroundStyle()}>
      <div className="relative max-w-5xl mx-auto">
        <div className={`${alignmentClass} mb-10`}>
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title || "Meet Our Team"}
          </h2>
          {section.subtitle && <p className={isDark ? "text-zinc-400" : "text-zinc-600"}>{section.subtitle}</p>}
        </div>

        <div className={gridClass}>
          {displayStaff.map((member) => {
            const colorClass = roleColors[member.roleColor] || "text-indigo-500";

            if (layout === "list") {
              return (
                <div key={member.username} className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] cursor-pointer ${isDark ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10" : "bg-white border border-zinc-200 shadow-sm hover:shadow-lg hover:border-zinc-300"}`}>
                  <div className="relative">
                    <img src={`https://minotar.net/bust/${member.username}/64`} alt={member.username} className="w-14 h-14 rounded-xl shadow-md group-hover:scale-105 transition-transform" />
                    {!!showOnlineStatus && <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 ${isDark ? "border-zinc-900" : "border-white"}`} />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{member.username}</p>
                    <p className={`text-sm font-semibold ${colorClass}`}>{member.role}</p>
                  </div>
                </div>
              );
            }

            if (layout === "compact") {
              return (
                <div key={member.username} className="group text-center">
                  <div className="relative mx-auto mb-2">
                    <img src={`https://minotar.net/bust/${member.username}/56`} alt={member.username} className="w-14 h-14 rounded-xl shadow-md group-hover:scale-110 transition-transform cursor-pointer" />
                    {!!showOnlineStatus && <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 ${isDark ? "border-zinc-900" : "border-zinc-50"}`} />}
                  </div>
                  <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>{member.username}</p>
                  <p className={`text-xs font-medium ${colorClass}`}>{member.role}</p>
                </div>
              );
            }

            return (
              <div key={member.username} className={`group text-center p-5 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer ${isDark ? "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10" : "bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:border-zinc-300"}`}>
                <div className="relative mx-auto mb-4 w-fit">
                  <img src={`https://minotar.net/bust/${member.username}/80`} alt={member.username} className="w-20 h-20 rounded-2xl shadow-lg group-hover:scale-105 transition-transform" />
                  {!!showOnlineStatus && <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 ${isDark ? "border-zinc-900" : "border-white"}`} />}
                </div>
                <p className={`font-bold text-base ${isDark ? "text-white" : "text-zinc-900"}`}>{member.username}</p>
                <p className={`text-sm font-semibold mt-1 ${colorClass}`}>{member.role}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreviewText({ section }: { section: Section }) {
  const textSettings = (section.settings.text as Record<string, unknown>) || {};
  const {
    content = "",
    alignment = "left",
    size = "medium",
    backgroundType = "solid",
    backgroundColor = "#ffffff",
    gradientFrom = "#ffffff",
    gradientTo = "#f4f4f5",
    backgroundImage = "",
    imageBlur = 0,
    imageDarken = 40,
  } = textSettings;

  const hasImage = backgroundType === "image" && backgroundImage;
  const isDark = hasImage || (backgroundType === "solid" && isColorDark(backgroundColor as string)) ||
    (backgroundType === "gradient" && isColorDark(gradientFrom as string));

  const getBackgroundStyle = () => {
    if (backgroundType === "solid") return { backgroundColor: backgroundColor as string };
    if (backgroundType === "gradient") return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
    return {};
  };

  const alignmentClass = alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "text-left";
  const sizeClass = size === "small" ? "text-sm" : size === "large" ? "text-lg" : "text-base";

  const displayContent = (content as string) || section.subtitle || "Add your custom text content here.";

  return (
    <div className="relative py-12 px-6 overflow-hidden" style={getBackgroundStyle()}>
      {hasImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})`, filter: `blur(${imageBlur}px)`, transform: 'scale(1.1)' }} />
          <div className="absolute inset-0 bg-black" style={{ opacity: (imageDarken as number) / 100 }} />
        </>
      )}
      <div className="relative max-w-3xl mx-auto">
        {section.title && (
          <h2 className={`text-2xl font-bold mb-4 ${alignmentClass} ${isDark ? "text-white" : "text-zinc-900"}`}>
            {section.title}
          </h2>
        )}
        <div className={`${alignmentClass} ${sizeClass} ${isDark ? "text-zinc-300" : "text-zinc-600"} leading-relaxed whitespace-pre-wrap`}>
          {displayContent}
        </div>
      </div>
    </div>
  );
}

// Main Preview Component
interface PreviewClientProps {
  server: ServerData;
  sections: Section[];
  isPreviewMode: boolean;
}

export default function PreviewClient({ server, sections, isPreviewMode }: PreviewClientProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {isPreviewMode && (
        <div className="bg-amber-500 text-white text-center py-2 text-sm font-medium">
          Preview Mode - This site is not published yet
        </div>
      )}
      {sections.map((section) => {
        if (!section.visible) return null;

        switch (section.type) {
          case "hero":
            return <PreviewHero key={section.id} section={section} serverData={server} />;
          case "stats":
            return <PreviewStats key={section.id} section={section} />;
          case "features":
            return <PreviewFeatures key={section.id} section={section} />;
          case "gamemodes":
            return <PreviewGamemodes key={section.id} section={section} />;
          case "discord":
            return <PreviewDiscord key={section.id} section={section} serverData={server} />;
          case "gallery":
            return <PreviewGallery key={section.id} section={section} />;
          case "staff":
            return <PreviewStaff key={section.id} section={section} />;
          case "text":
            return <PreviewText key={section.id} section={section} />;
          default:
            return (
              <section key={section.id} className="py-16 bg-zinc-100">
                <div className="mx-auto max-w-5xl px-6 text-center">
                  <h2 className="text-2xl font-bold mb-2">{section.title || section.type}</h2>
                  <p className="text-zinc-500">Section type: {section.type}</p>
                </div>
              </section>
            );
        }
      })}
    </div>
  );
}
