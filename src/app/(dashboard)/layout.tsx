"use client";

import { Sidebar, useSidebarStore } from "@/components/layout";
import { motion } from "framer-motion";
import { Bell, Search, ChevronDown } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-white to-emerald-50/30" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-emerald-100/20 rounded-full blur-3xl" />
      </div>

      <Sidebar />

      <motion.div
        initial={false}
        animate={{ paddingLeft: collapsed ? 52 : 200 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search servers, settings..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-100/80 border-0 rounded-xl text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-zinc-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
              </motion.button>

              {/* Divider */}
              <div className="w-px h-8 bg-zinc-200" />

              {/* User Menu */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                  S
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-zinc-700">Senne</p>
                  <p className="text-xs text-zinc-400">Free Plan</p>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
