'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
	BarChart3,
	ChevronLeft,
	ChevronRight,
	HelpCircle,
	LayoutDashboard,
	PanelLeft,
	PanelLeftClose,
	Plus,
	Server,
	Settings,
} from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

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
			name: 'sidebar-state',
		},
	),
);

const navItems = [
	{
		label: 'Dashboard',
		href: '/dashboard',
		icon: LayoutDashboard,
	},
	{
		label: 'Websites',
		href: '/dashboard/servers',
		icon: Server,
	},
	{
		label: 'Analytics',
		href: '/dashboard/analytics',
		icon: BarChart3,
		badge: 'Soon',
	},
	{
		label: 'Settings',
		href: '/dashboard/settings',
		icon: Settings,
	},
];

const bottomNavItems = [
	{
		label: 'Help & Support',
		href: '/support',
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
			transition={{ duration: 0.2, ease: 'easeInOut' }}
			className="fixed top-0 left-0 z-40 flex h-full flex-col border-r border-zinc-200/80 bg-white/80 backdrop-blur-xl"
		>
			{/* Logo */}
			<div className="flex h-12 items-center justify-between border-b border-zinc-200/80 px-3">
				<Link href="/" className="flex items-center gap-1.5 overflow-hidden">
					<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-emerald-500">
						<span className="text-[10px] font-bold text-white">M</span>
					</div>
					<AnimatePresence>
						{!collapsed && (
							<motion.span
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: 'auto' }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.15 }}
								className="font-display overflow-hidden text-sm font-bold whitespace-nowrap text-zinc-900"
							>
								Mine
								<span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
									Sites
								</span>
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
						'flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-xs font-medium text-white transition-shadow hover:shadow-lg hover:shadow-cyan-200/50',
						collapsed ? 'h-9 w-9 p-0' : 'w-full px-3 py-2',
					)}
				>
					<Plus className="h-3.5 w-3.5 flex-shrink-0" />
					<AnimatePresence>
						{!collapsed && (
							<motion.span
								initial={{ opacity: 0, width: 0 }}
								animate={{ opacity: 1, width: 'auto' }}
								exit={{ opacity: 0, width: 0 }}
								transition={{ duration: 0.15 }}
								className="overflow-hidden whitespace-nowrap"
							>
								New Website
							</motion.span>
						)}
					</AnimatePresence>
				</motion.button>
			</div>

			{/* Main Navigation */}
			<nav className="flex-1 overflow-hidden px-2 py-1">
				<AnimatePresence>
					{!collapsed && (
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="mb-1 px-2 text-[10px] font-medium tracking-wider text-zinc-400 uppercase"
						>
							Menu
						</motion.p>
					)}
				</AnimatePresence>
				<ul className="space-y-0.5">
					{navItems.map((item) => {
						const isActive =
							pathname === item.href ||
							(item.href !== '/dashboard' && pathname.startsWith(item.href));

						return (
							<li key={item.href}>
								<Link href={item.href}>
									<motion.div
										whileHover={{ x: collapsed ? 0 : 2 }}
										className={cn(
											'flex items-center rounded-lg text-xs font-medium transition-all duration-150',
											collapsed
												? 'justify-center p-2'
												: 'justify-between px-2 py-1.5',
											isActive
												? 'border border-cyan-200/50 bg-gradient-to-r from-cyan-50 to-emerald-50 text-cyan-700'
												: 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
										)}
										title={collapsed ? item.label : undefined}
									>
										<div
											className={cn(
												'flex items-center',
												collapsed ? '' : 'gap-2',
											)}
										>
											<item.icon
												className={cn(
													'h-4 w-4 flex-shrink-0',
													isActive ? 'text-cyan-600' : 'text-zinc-400',
												)}
											/>
											<AnimatePresence>
												{!collapsed && (
													<motion.span
														initial={{ opacity: 0, width: 0 }}
														animate={{ opacity: 1, width: 'auto' }}
														exit={{ opacity: 0, width: 0 }}
														transition={{ duration: 0.15 }}
														className="overflow-hidden whitespace-nowrap"
													>
														{item.label}
													</motion.span>
												)}
											</AnimatePresence>
										</div>
										{!collapsed && item.badge && (
											<span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">
												{item.badge}
											</span>
										)}
										{!collapsed && isActive && (
											<ChevronRight className="h-3 w-3 text-cyan-500" />
										)}
									</motion.div>
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Bottom Navigation */}
			<div className="border-t border-zinc-200/80 p-2">
				<ul className="space-y-0.5">
					{bottomNavItems.map((item) => (
						<li key={item.href}>
							<Link href={item.href}>
								<motion.div
									whileHover={{ x: collapsed ? 0 : 2 }}
									className={cn(
										'flex items-center rounded-lg text-xs font-medium text-zinc-500 transition-all duration-150 hover:bg-zinc-50 hover:text-zinc-700',
										collapsed ? 'justify-center p-2' : 'gap-2 px-2 py-1.5',
									)}
									title={collapsed ? item.label : undefined}
								>
									<item.icon className="h-4 w-4 flex-shrink-0 text-zinc-400" />
									<AnimatePresence>
										{!collapsed && (
											<motion.span
												initial={{ opacity: 0, width: 0 }}
												animate={{ opacity: 1, width: 'auto' }}
												exit={{ opacity: 0, width: 0 }}
												transition={{ duration: 0.15 }}
												className="overflow-hidden whitespace-nowrap"
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
						'mt-1 flex items-center rounded-lg text-xs font-medium text-zinc-400 transition-all duration-150 hover:bg-zinc-100 hover:text-zinc-600',
						collapsed ? 'w-full justify-center p-2' : 'w-full gap-2 px-2 py-1.5',
					)}
				>
					{collapsed ? (
						<PanelLeft className="h-4 w-4" />
					) : (
						<>
							<PanelLeftClose className="h-4 w-4" />
							<span>Collapse</span>
						</>
					)}
				</motion.button>
			</div>
		</motion.aside>
	);
}
