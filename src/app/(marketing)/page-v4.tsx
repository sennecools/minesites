"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { Server, Users, Brush, Globe, ChevronRight, Play } from "lucide-react";

const showcaseServers = [
  {
    name: "SkyBlock Paradise",
    type: "Skyblock",
    players: "1.2k",
    color: "from-emerald-500 to-teal-600",
    icon: "🏝️",
  },
  {
    name: "Dragon's Realm",
    type: "Survival",
    players: "847",
    color: "from-orange-500 to-red-600",
    icon: "🐉",
  },
  {
    name: "PvP Masters",
    type: "Factions",
    players: "2.1k",
    color: "from-purple-500 to-indigo-600",
    icon: "⚔️",
  },
];

export default function HomePage() {
  return (
    <div className="bg-zinc-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 via-zinc-950 to-zinc-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Floating blocks decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20"
          />
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[30%] right-[15%] w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20"
          />
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[30%] left-[20%] w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border border-blue-500/20"
          />
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-[50%] right-[8%] w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/10 border border-purple-500/20"
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Now in public beta
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Give your server
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400">
                  a home online
                </span>
              </h1>

              <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                Create a stunning website for your Minecraft server.
                Show off your community, features, and get more players joining.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="text-base px-8 bg-emerald-500 hover:bg-emerald-600">
                    Start building free
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <button className="flex items-center gap-2 px-6 py-3 text-zinc-300 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  Watch demo
                </button>
              </div>
            </motion.div>

            {/* Server showcase cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {showcaseServers.map((server, i) => (
                <motion.div
                  key={server.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="group relative rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 hover:border-zinc-700 transition-all hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${server.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${server.color} flex items-center justify-center text-lg`}>
                        {server.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white">{server.name}</div>
                        <div className="text-xs text-zinc-500">{server.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Online now</span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {server.players}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-zinc-800/50">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything your server needs
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              Built specifically for Minecraft communities. No coding required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Large feature card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:row-span-2 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800 p-8 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <Server className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Live server status</h3>
                <p className="text-zinc-400 mb-8">
                  Display real-time player counts, server version, and online status. Updates automatically.
                </p>

                {/* Mock server status */}
                <div className="rounded-xl bg-zinc-950/50 border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <span>⚔️</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">play.myserver.net</div>
                        <div className="text-xs text-zinc-500">Minecraft 1.21</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                      Online
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 rounded-full bg-zinc-800">
                      <div className="w-3/4 h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                    </div>
                    <span className="text-sm text-zinc-400">156/200</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Smaller feature cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl bg-zinc-900/50 border border-zinc-800 p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <Brush className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Easy customization</h3>
              <p className="text-sm text-zinc-400">
                Drag-and-drop editor. Change colors, fonts, and layout with a few clicks.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl bg-zinc-900/50 border border-zinc-800 p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Free subdomain</h3>
              <p className="text-sm text-zinc-400">
                Get yourserver.minesites.net for free, or connect your own custom domain.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 border-t border-zinc-800/50">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-zinc-500">Servers</div>
              </div>
              <div className="w-px h-10 bg-zinc-800" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50k+</div>
                <div className="text-sm text-zinc-500">Players reached</div>
              </div>
              <div className="w-px h-10 bg-zinc-800 hidden sm:block" />
              <div className="text-center hidden sm:block">
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="text-sm text-zinc-500">Avg. rating</div>
              </div>
            </div>
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-xs"
                >
                  {["🎮", "⚔️", "🏰", "🐉", "🌟"][i]}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-zinc-950 flex items-center justify-center text-xs text-emerald-400 font-medium">
                +99
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />

            <div className="relative px-8 py-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to grow your community?
              </h2>
              <p className="text-emerald-100 max-w-lg mx-auto mb-8">
                Join hundreds of server owners who already trust MineSites for their online presence.
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-base px-8 bg-white text-emerald-600 hover:bg-emerald-50">
                  Get started for free
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
