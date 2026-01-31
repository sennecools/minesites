"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Layers, BarChart3, Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-emerald-50" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-cyan-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-100/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative min-h-screen flex">
        {/* Left side - Branding (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 xl:p-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl font-bold tracking-tight text-zinc-900">
                MC<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">site</span>
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <h1 className="font-display text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.1] text-zinc-900">
              Beautiful websites
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">for Minecraft servers</span>
            </h1>
            <p className="text-base text-zinc-500 max-w-sm leading-relaxed">
              Create stunning landing pages in minutes. No coding required.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-6">
              {[
                { icon: Layers, text: "Drag & drop builder", color: "from-cyan-500 to-blue-500" },
                { icon: BarChart3, text: "Live server status", color: "from-violet-500 to-purple-500" },
                { icon: Zap, text: "Instant publishing", color: "from-emerald-500 to-teal-500" },
              ].map((feature, i) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-sm text-zinc-400"
          >
            Trusted by 1,000+ server owners
          </motion.p>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-8 sm:p-10"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
