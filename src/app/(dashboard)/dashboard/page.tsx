'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Eye, Loader2, Plus, Server, Sparkles, Users } from 'lucide-react';

import { useState } from 'react';

import { useWebsites, WebsiteCard } from '@/components/dashboard';

import { CreateWebsiteDialog } from './create-website-dialog';

export default function DashboardPage() {
	// WR-03 / WR-04: useWebsites() is the shared loader from
	// @/components/dashboard. Both list pages call it so the fetch lifecycle,
	// loading flag, error message, and refetch path are defined once.
	const { websites: servers, isLoading, error, refetch } = useWebsites();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	const stats = [
		{
			label: 'Total Views',
			value: '0',
			change: '-',
			icon: Eye,
			color: 'from-cyan-500 to-blue-500',
		},
		{
			label: 'Total Players',
			value: '0',
			change: '-',
			icon: Users,
			color: 'from-emerald-500 to-teal-500',
		},
		{
			label: 'Active Servers',
			value: servers.filter((s) => s.published).length.toString(),
			change: '-',
			icon: Server,
			color: 'from-violet-500 to-purple-500',
		},
	];

	if (isLoading) {
		return (
			<div className="mx-auto flex min-h-[400px] max-w-6xl items-center justify-center">
				<div className="flex items-center gap-3 text-zinc-500">
					<Loader2 className="h-5 w-5 animate-spin" />
					<span>Loading your websites...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-6xl">
				<div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
					<p className="font-medium text-red-600">{error}</p>
					<button
						onClick={refetch}
						className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
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
					className="mt-1 text-zinc-500"
				>
					Here's what's happening with your websites today
				</motion.p>
			</div>

			{/* Stats Grid */}
			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
				{stats.map((stat, i) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.1 }}
						whileHover={{ y: -2, transition: { duration: 0.15 } }}
						className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
					>
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm text-zinc-500">{stat.label}</p>
								<p className="mt-1 text-2xl font-bold text-zinc-900">
									{stat.value}
								</p>
								<p className="mt-1 text-xs text-zinc-400">
									{stat.change === '-'
										? 'Coming soon'
										: `${stat.change} from last week`}
								</p>
							</div>
							<div
								className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
							>
								<stat.icon className="h-5 w-5 text-white" />
							</div>
						</div>
					</motion.div>
				))}
			</div>

			{/* Servers Section */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-zinc-900">Your Websites</h2>
					<p className="text-sm text-zinc-500">Manage your Minecraft server websites</p>
				</div>
				<CreateWebsiteDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
			</div>

			{/* Server Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{servers.map((website, i) => (
					<WebsiteCard key={website.id} website={website} index={i} />
				))}

				{/* Create New Server Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 + servers.length * 0.1 }}
				>
					<motion.button
						onClick={() => setCreateDialogOpen(true)}
						whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.15 } }}
						className="group flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 p-5 transition-all hover:border-cyan-300 hover:bg-cyan-50/30"
					>
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 transition-all group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-emerald-500">
							<Plus className="h-6 w-6 text-zinc-400 transition-colors group-hover:text-white" />
						</div>
						<div className="text-center">
							<p className="font-medium text-zinc-600 transition-colors group-hover:text-cyan-600">
								Create a website
							</p>
							<p className="mt-1 text-xs text-zinc-400">
								Add another Minecraft website
							</p>
						</div>
					</motion.button>
				</motion.div>
			</div>

			{/* Empty State */}
			{servers.length === 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="py-16 text-center"
				>
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
						<Server className="h-8 w-8 text-zinc-300" />
					</div>
					<h3 className="mb-1 text-lg font-semibold text-zinc-900">No websites yet</h3>
					<p className="mb-6 text-zinc-500">Create your first website to get started</p>
					<motion.button
						onClick={() => setCreateDialogOpen(true)}
						whileHover={{ scale: 1.02, y: -1 }}
						whileTap={{ scale: 0.98 }}
						className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-shadow hover:shadow-lg hover:shadow-cyan-200/50"
					>
						<Plus className="h-4 w-4" />
						Create Website
					</motion.button>
				</motion.div>
			)}

			{/* Quick Tips */}
			{servers.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
					className="mt-8 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-emerald-50 p-6"
				>
					<div className="flex items-start gap-4">
						<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500">
							<Sparkles className="h-5 w-5 text-white" />
						</div>
						<div>
							<h3 className="font-semibold text-zinc-900">
								Pro tip: Boost your visibility
							</h3>
							<p className="mt-1 text-sm text-zinc-600">
								Add a custom domain to your server site to increase trust and make
								your server easier to find. Upgrade to Pro to unlock custom domains
								and advanced analytics.
							</p>
							<motion.button
								whileHover={{ x: 4 }}
								className="mt-3 flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-700"
							>
								Upgrade to Pro <ArrowUpRight className="h-4 w-4" />
							</motion.button>
						</div>
					</div>
				</motion.div>
			)}
		</div>
	);
}
