'use client';

import { motion } from 'framer-motion';
import { Bell, ChevronDown, Search } from 'lucide-react';

import { Sidebar, useSidebarStore } from '@/components/layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const { collapsed } = useSidebarStore();

	return (
		<div className="min-h-screen bg-zinc-50/50">
			{/* Subtle background gradient */}
			<div className="fixed inset-0 -z-10">
				<div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-white to-emerald-50/30" />
				<div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-cyan-100/20 blur-3xl" />
				<div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-emerald-100/20 blur-3xl" />
			</div>

			<Sidebar />

			<motion.div
				initial={false}
				animate={{ paddingLeft: collapsed ? 52 : 200 }}
				transition={{ duration: 0.2, ease: 'easeInOut' }}
			>
				{/* Header */}
				<header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
					<div className="flex h-16 items-center justify-between px-6">
						{/* Search */}
						<div className="max-w-md flex-1">
							<div className="relative">
								<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
								<input
									type="text"
									placeholder="Search websites, settings..."
									className="w-full rounded-xl border-0 bg-zinc-100/80 py-2 pr-4 pl-10 text-sm transition-all placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
								/>
							</div>
						</div>

						{/* Right side */}
						<div className="flex items-center gap-3">
							{/* Notifications */}
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="relative rounded-xl p-2 transition-colors hover:bg-zinc-100"
							>
								<Bell className="h-5 w-5 text-zinc-500" />
								<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-500" />
							</motion.button>

							{/* Divider */}
							<div className="h-8 w-px bg-zinc-200" />

							{/* User Menu */}
							<motion.button
								whileHover={{ scale: 1.01 }}
								className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-colors hover:bg-zinc-100"
							>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 text-sm font-medium text-white">
									S
								</div>
								<div className="hidden text-left sm:block">
									<p className="text-sm font-medium text-zinc-700">Senne</p>
									<p className="text-xs text-zinc-400">Free Plan</p>
								</div>
								<ChevronDown className="h-4 w-4 text-zinc-400" />
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
