"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={copy} className="text-zinc-400 hover:text-white transition-colors">
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Fun badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-sm mb-8">
              <span>✨</span>
              <span>Stop sending people to a boring IP address</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Your server is cool.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400">
                Your website should be too.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto">
              Build a website that matches your server's energy.
              No coding, no designers, no headaches.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="text-base px-8 bg-white text-black hover:bg-zinc-200 font-semibold">
                  Build yours free →
                </Button>
              </Link>
              <span className="text-zinc-600 text-sm">takes like 5 mins</span>
            </div>
          </motion.div>

          {/* Example sites showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-20"
          >
            {/* Browser mockup */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-800 text-sm text-zinc-400">
                    <span className="text-green-400">●</span>
                    epicpvp.minesites.net
                  </div>
                </div>
              </div>

              {/* Site preview */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/30">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Server info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
                        ⚔️
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">EpicPvP</h3>
                        <p className="text-zinc-500">The #1 PvP experience</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                        🟢 1,247 playing
                      </span>
                      <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-sm">
                        1.8 - 1.21
                      </span>
                      <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-sm">
                        Kit PvP
                      </span>
                    </div>

                    {/* IP Copy */}
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <code className="text-sm text-zinc-300 font-mono">play.epicpvp.net</code>
                      <CopyButton text="play.epicpvp.net" />
                    </div>
                  </div>

                  {/* Game modes */}
                  <div className="grid grid-cols-2 gap-3 sm:w-64">
                    {[
                      { name: "Kit PvP", icon: "⚔️", color: "from-red-500/20 to-orange-500/10" },
                      { name: "Duels", icon: "🤺", color: "from-blue-500/20 to-cyan-500/10" },
                      { name: "UHC", icon: "💀", color: "from-purple-500/20 to-pink-500/10" },
                      { name: "Ranked", icon: "🏆", color: "from-yellow-500/20 to-amber-500/10" },
                    ].map((mode) => (
                      <div
                        key={mode.name}
                        className={`p-3 rounded-xl bg-gradient-to-br ${mode.color} border border-white/5`}
                      >
                        <span className="text-lg mb-1 block">{mode.icon}</span>
                        <span className="text-sm text-white font-medium">{mode.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why section - casual tone */}
      <section className="py-20 px-4 border-t border-zinc-800/50">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why bother with a website?
            </h2>
            <p className="text-zinc-400 text-lg">
              Fair question. Here's the deal:
            </p>
          </motion.div>

          <div className="grid gap-4">
            {[
              {
                emoji: "🔍",
                title: "Players can actually find you",
                desc: "Show up on Google instead of being buried in server lists",
              },
              {
                emoji: "💅",
                title: "Look legit",
                desc: "A real website hits different than a Discord invite link",
              },
              {
                emoji: "📊",
                title: "Show off your stats",
                desc: "Live player count, server status, all updating automatically",
              },
              {
                emoji: "🎨",
                title: "Match your vibe",
                desc: "Your server has a brand. Your website should too.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - super simple */}
      <section className="py-20 px-4 border-t border-zinc-800/50">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12">
              Stupid simple
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              {[
                { step: "1", text: "Pick a template" },
                { step: "2", text: "Add your stuff" },
                { step: "3", text: "Hit publish" },
              ].map((item, i) => (
                <div key={item.step} className="flex items-center gap-4 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-lg font-bold text-white">
                      {item.step}
                    </span>
                    <span className="text-zinc-300 font-medium">{item.text}</span>
                  </div>
                  {i < 2 && (
                    <span className="hidden sm:block text-zinc-700">→</span>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-8 text-zinc-500">
              That's it. No tutorials needed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-800"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to upgrade from
              <br />
              <span className="text-zinc-500 line-through">play.myserver.net</span>
              <span className="text-green-400"> ?</span>
            </h2>
            <p className="text-zinc-400 mb-8">
              Free tier. No credit card. No BS.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-base px-8 bg-white text-black hover:bg-zinc-200 font-semibold">
                Let's go →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
