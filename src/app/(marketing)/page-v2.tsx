"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { Paintbrush, BarChart3, Globe, MessageCircle, Check } from "lucide-react";

const features = [
  {
    title: "Drag & Drop Builder",
    description: "Build your site visually with our intuitive editor. No coding required.",
    icon: Paintbrush,
  },
  {
    title: "Live Server Status",
    description: "Display real-time player counts and server status automatically.",
    icon: BarChart3,
  },
  {
    title: "Custom Domain",
    description: "Get yourserver.mcsite.com or connect your own domain.",
    icon: Globe,
  },
  {
    title: "Discord Integration",
    description: "Sign in with Discord and embed your community widget.",
    icon: MessageCircle,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-900">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 via-slate-900 to-indigo-600/10" />

          {/* Abstract shapes */}
          <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-40 right-[15%] w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute bottom-20 left-[20%] w-80 h-80 rounded-full bg-blue-500/8 blur-3xl" />

          {/* Geometric shapes */}
          <div className="absolute top-32 right-[20%] w-24 h-24 border border-white/5 rounded-2xl rotate-12" />
          <div className="absolute top-[60%] left-[8%] w-16 h-16 border border-white/5 rounded-xl -rotate-12" />
          <div className="absolute bottom-32 right-[12%] w-20 h-20 border border-white/5 rounded-full" />
          <div className="absolute top-[45%] right-[35%] w-12 h-12 bg-cyan-500/10 rounded-lg rotate-45" />
          <div className="absolute bottom-[40%] left-[15%] w-8 h-8 bg-indigo-500/10 rounded-full" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-400 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Now in public beta
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                Websites for
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Minecraft servers
                </span>
              </h1>

              <p className="mt-6 text-lg text-slate-400 max-w-lg leading-relaxed">
                Create a stunning landing page for your server in minutes.
                No coding needed. Just drag, drop, and publish.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/signup">
                  <Button size="lg">Start for free</Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="secondary" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                    View pricing
                  </Button>
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Free tier available
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  No credit card required
                </div>
              </div>
            </motion.div>

            {/* Right - Browser mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Browser window */}
              <div className="rounded-2xl bg-slate-800/50 backdrop-blur border border-white/10 shadow-2xl overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-900/50 text-sm text-slate-400">
                      <Globe className="w-3.5 h-3.5" />
                      epiccraft.mcsite.com
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Hero section mockup */}
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-xl">⚔️</span>
                      </div>
                      <div>
                        <div className="font-semibold text-white">EpicCraft</div>
                        <div className="text-sm text-slate-400">play.epiccraft.net</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                        247 online
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-sm">
                        1.20.4
                      </div>
                    </div>
                  </div>

                  {/* Feature cards mockup */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white/5 p-4 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-2">
                        <span className="text-sm">🏰</span>
                      </div>
                      <div className="text-sm font-medium text-white">Survival</div>
                      <div className="text-xs text-slate-500 mt-1">Classic gameplay</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-4 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
                        <span className="text-sm">⚔️</span>
                      </div>
                      <div className="text-sm font-medium text-white">PvP Arena</div>
                      <div className="text-xs text-slate-500 mt-1">Competitive battles</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              Built specifically for Minecraft server owners who want a professional online presence
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white mb-4">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to stand out?
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Join server owners who&apos;ve already upgraded their online presence
            </p>
            <div className="mt-10">
              <Link href="/signup">
                <Button size="lg">Create your site</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
