"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Server,
  Users,
  Eye,
  ArrowUpRight,
  Sparkles,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";

interface ServerData {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  serverIp: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadServers() {
      try {
        const response = await fetch("/api/servers");
        if (!response.ok) {
          throw new Error("Failed to load servers");
        }
        const data = await response.json();
        setServers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load servers");
      } finally {
        setIsLoading(false);
      }
    }
    loadServers();
  }, []);

  const stats = [
    { label: "Total Views", value: "0", change: "-", icon: Eye, color: "from-cyan-500 to-blue-500" },
    { label: "Total Players", value: "0", change: "-", icon: Users, color: "from-emerald-500 to-teal-500" },
    { label: "Active Servers", value: servers.filter(s => s.published).length.toString(), change: "-", icon: Server, color: "from-violet-500 to-purple-500" },
  ];

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your servers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-bold text-zinc-900"
        >
          Welcome back
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-zinc-500 mt-1"
        >
          Here's what's happening with your servers today
        </motion.p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</p>
                <p className="text-xs mt-1 text-zinc-400">
                  {stat.change === "-" ? "Coming soon" : `${stat.change} from last week`}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Servers Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Your Servers</h2>
          <p className="text-sm text-zinc-500">Manage your Minecraft server websites</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          New Server
        </motion.button>
      </div>

      {/* Server Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {servers.map((server, i) => (
          <motion.div
            key={server.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Link href={`/dashboard/${server.id}`}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="group p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-sm hover:shadow-lg hover:border-cyan-200/50 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      server.published
                        ? 'bg-gradient-to-br from-cyan-500 to-emerald-500'
                        : 'bg-zinc-200'
                    }`}>
                      <Server className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 group-hover:text-cyan-600 transition-colors">
                        {server.name}
                      </h3>
                      <p className="text-xs text-zinc-400">{server.subdomain}.minesites.net</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => e.preventDefault()}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                  </motion.button>
                </div>

                {/* Description */}
                {server.description && (
                  <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                    {server.description}
                  </p>
                )}

                {/* Info */}
                <div className="flex items-center gap-4 mb-4">
                  {server.serverIp && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Server className="w-3.5 h-3.5" />
                      <span className="font-mono">{server.serverIp}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    server.published
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      server.published ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`} />
                    {server.published ? 'Live' : 'Draft'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}

        {/* Create New Server Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + servers.length * 0.1 }}
        >
          <motion.button
            whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.15 } }}
            className="w-full h-full min-h-[200px] p-5 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-100 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-emerald-500 flex items-center justify-center transition-all">
              <Plus className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-medium text-zinc-600 group-hover:text-cyan-600 transition-colors">Create new server</p>
              <p className="text-xs text-zinc-400 mt-1">Add another website</p>
            </div>
          </motion.button>
        </motion.div>
      </div>

      {/* Empty State */}
      {servers.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 mx-auto mb-4 flex items-center justify-center">
            <Server className="w-8 h-8 text-zinc-300" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No servers yet</h3>
          <p className="text-zinc-500 mb-6">Create your first server to get started</p>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-shadow"
          >
            <Plus className="w-4 h-4" />
            Create Server
          </motion.button>
        </motion.div>
      )}

      {/* Quick Tips */}
      {servers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-emerald-50 border border-cyan-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Pro tip: Boost your visibility</h3>
              <p className="text-sm text-zinc-600 mt-1">
                Add a custom domain to your server site to increase trust and make your server easier to find.
                Upgrade to Pro to unlock custom domains and advanced analytics.
              </p>
              <motion.button
                whileHover={{ x: 4 }}
                className="mt-3 text-sm font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
              >
                Upgrade to Pro <ArrowUpRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
