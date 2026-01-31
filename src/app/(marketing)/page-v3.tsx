"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { Sparkles, Users, Zap, Palette, ArrowRight } from "lucide-react";

export default function HomePageV3() {
  return (
    <div className="bg-[#FAFAF9]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Now in public beta
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.05]">
              Your server,
              <br />
              <span className="relative">
                your website
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 4 150 7C200 10 250 6 298 8" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="mt-8 text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Build a beautiful website for your Minecraft server.
              No design skills needed — just pick, customize, and publish.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="text-base px-8">
                  Start building
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <span className="text-sm text-zinc-500">Free forever for basic sites</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Large card - Preview */}
            <div className="lg:col-span-2 lg:row-span-2 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-8 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">See it come to life</h3>
                <p className="text-cyan-100 max-w-sm">
                  Watch your changes in real-time as you build your perfect server page
                </p>
              </div>

              {/* Mini browser mockup */}
              <div className="mt-6 relative">
                <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 overflow-hidden shadow-2xl">
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/20 border-b border-white/10">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                    </div>
                    <div className="flex-1 text-center text-xs text-white/60">myserver.minesites.net</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/20" />
                      <div className="space-y-1.5">
                        <div className="w-24 h-3 rounded bg-white/30" />
                        <div className="w-16 h-2 rounded bg-white/20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-12 rounded-lg bg-white/10" />
                      <div className="h-12 rounded-lg bg-white/10" />
                      <div className="h-12 rounded-lg bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative circles */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/10" />
              <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />
            </div>

            {/* Server status card */}
            <div className="rounded-3xl bg-white border border-zinc-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">Live player count</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Show real-time stats from your server automatically
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  156 online
                </span>
              </div>
            </div>

            {/* Speed card */}
            <div className="rounded-3xl bg-white border border-zinc-200 p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900">Ready in minutes</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Pick a template, add your details, and you're live
              </p>
            </div>

            {/* Customization card - wide */}
            <div className="md:col-span-2 lg:col-span-2 rounded-3xl bg-zinc-900 p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                    <Palette className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Make it yours</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Customize colors, fonts, and layout to match your server's brand
                  </p>
                </div>
                <div className="flex gap-2">
                  {['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-violet-500'].map((color, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${color} ${i === 3 ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Domain card */}
            <div className="rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Free subdomain</h3>
              <p className="text-sm text-violet-200 mb-4">
                Get yourserver.minesites.net included
              </p>
              <div className="px-3 py-2 rounded-lg bg-white/20 backdrop-blur text-sm font-mono">
                epic.minesites.net
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-zinc-500 mb-6">Trusted by server owners</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-60">
              {['CraftWorld', 'PixelMC', 'SkyBlock+', 'MineCity', 'DragonRealm'].map((name) => (
                <span key={name} className="text-xl font-bold text-zinc-400">{name}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-zinc-900 p-12 text-center text-white relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                Create your server's website in minutes. No credit card required.
              </p>
              <Link href="/signup">
                <Button size="lg" className="text-base px-8">
                  Create your site
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
