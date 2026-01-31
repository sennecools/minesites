"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Server,
  ArrowUpRight,
  MoreHorizontal,
  Search,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
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

export default function ServersPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-300" />
        <span className="text-zinc-900 font-medium">Servers</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900">Your Servers</h1>
          <p className="text-zinc-500 mt-1">Manage your Minecraft server websites</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-shadow"
        >
          <Plus className="w-4 h-4" />
          New Server
        </motion.button>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search servers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl text-sm font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </motion.button>
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-cyan-600"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-cyan-600"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Server List/Grid */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServers.map((server, i) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
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
            transition={{ delay: filteredServers.length * 0.05 }}
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
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Server</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Server IP</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Updated</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredServers.map((server, i) => (
                <motion.tr
                  key={server.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/${server.id}`} className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        server.published
                          ? 'bg-gradient-to-br from-cyan-500 to-emerald-500'
                          : 'bg-zinc-200'
                      }`}>
                        <Server className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900 hover:text-cyan-600 transition-colors">{server.name}</p>
                        <p className="text-xs text-zinc-400">{server.subdomain}.minesites.net</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
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
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600 font-mono">
                      {server.serverIp || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-500">{formatRelativeTime(server.updatedAt)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/${server.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 text-sm font-medium text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                      >
                        Edit
                      </motion.button>
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredServers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 mx-auto mb-4 flex items-center justify-center">
            <Server className="w-8 h-8 text-zinc-300" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No servers found</h3>
          <p className="text-zinc-500 mb-6">
            {searchQuery ? "Try a different search term" : "Create your first server to get started"}
          </p>
          {!searchQuery && (
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-shadow"
            >
              <Plus className="w-4 h-4" />
              Create Server
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}
