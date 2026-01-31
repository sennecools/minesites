"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Server,
  LayoutDashboard,
  BarChart3,
  Settings,
  HelpCircle,
  Plus,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Sidebar state store
interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    {
      name: "sidebar-state",
    }
  )
);

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Servers",
    href: "/dashboard/servers",
    icon: Server,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    badge: "Soon",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const bottomNavItems = [
  {
    label: "Help & Support",
    href: "/support",
    icon: HelpCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 52 : 200 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full border-r border-zinc-200/80 bg-white/80 backdrop-blur-xl z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="flex h-12 items-center justify-between border-b border-zinc-200/80 px-3">
        <Link href="/" className="flex items-center gap-1.5 overflow-hidden">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-[10px]">M</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="font-display text-sm font-bold text-zinc-900 whitespace-nowrap overflow-hidden"
              >
                Mine<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">Sites</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Quick Action */}
      <div className="p-2">
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-cyan-200/50 transition-shadow",
            collapsed ? "w-9 h-9 p-0" : "w-full px-3 py-2"
          )}
        >
          <Plus className="w-3.5 h-3.5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap overflow-hidden"
              >
                New Server
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-1 overflow-hidden">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-2 mb-1 text-[10px] font-medium text-zinc-400 uppercase tracking-wider"
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 2 }}
                    className={cn(
                      "flex items-center rounded-lg text-xs font-medium transition-all duration-150",
                      collapsed ? "justify-center p-2" : "justify-between px-2 py-1.5",
                      isActive
                        ? "bg-gradient-to-r from-cyan-50 to-emerald-50 text-cyan-700 border border-cyan-200/50"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className={cn("flex items-center", collapsed ? "" : "gap-2")}>
                      <item.icon className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isActive ? "text-cyan-600" : "text-zinc-400"
                      )} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.15 }}
                            className="whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-medium bg-zinc-100 text-zinc-500 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {!collapsed && isActive && (
                      <ChevronRight className="w-3 h-3 text-cyan-500" />
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-2 border-t border-zinc-200/80">
        <ul className="space-y-0.5">
          {bottomNavItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 2 }}
                  className={cn(
                    "flex items-center rounded-lg text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-all duration-150",
                    collapsed ? "justify-center p-2" : "gap-2 px-2 py-1.5"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Collapse Toggle */}
        <motion.button
          onClick={toggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "mt-1 flex items-center rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all duration-150",
            collapsed ? "justify-center p-2 w-full" : "gap-2 px-2 py-1.5 w-full"
          )}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
