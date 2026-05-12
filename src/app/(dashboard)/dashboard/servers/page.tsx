'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Filter, Grid3X3, List, Loader2, Plus, Search, Server } from 'lucide-react';

import { useState } from 'react';

import Link from 'next/link';

import { useWebsites, WebsiteCard } from '@/components/dashboard';
import { formatRelativeTime } from '@/lib/utils';

import { CreateWebsiteDialog } from '../create-website-dialog';

export default function ServersPage() {
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [searchQuery, setSearchQuery] = useState('');
	// WR-03 / WR-04: shared loader from @/components/dashboard. Both list
	// pages call useWebsites() so the fetch path, error/loading state, and
	// refetch handler stay in lockstep.
	const { websites: servers, isLoading, error, refetch } = useWebsites();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	const filteredServers = servers.filter(
		(server) =>
			server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			server.subdomain.toLowerCase().includes(searchQuery.toLowerCase()),
	);

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
			{/* Breadcrumb */}
			<div className="mb-4 flex items-center gap-2 text-sm">
				<Link
					href="/dashboard"
					className="text-zinc-400 transition-colors hover:text-zinc-600"
				>
					Dashboard
				</Link>
				<ChevronRight className="h-4 w-4 text-zinc-300" />
				<span className="font-medium text-zinc-900">Websites</span>
			</div>

			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="font-display text-2xl font-bold text-zinc-900">Your Websites</h1>
					<p className="mt-1 text-zinc-500">Manage your Minecraft server websites</p>
				</div>
				<motion.button
					whileHover={{ scale: 1.02, y: -1 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setCreateDialogOpen(true)}
					className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-shadow hover:shadow-lg hover:shadow-cyan-200/50"
				>
					<Plus className="h-4 w-4" />
					New Website
				</motion.button>
			</div>

			{/* Filters & Search */}
			<div className="mb-6 flex items-center justify-between gap-4">
				<div className="relative max-w-md flex-1">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
					<input
						type="text"
						placeholder="Search websites..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pr-4 pl-10 text-sm transition-all placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
					/>
				</div>
				<div className="flex items-center gap-2">
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
					>
						<Filter className="h-4 w-4" />
						Filter
					</motion.button>
					<div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
						<button
							onClick={() => setViewMode('grid')}
							className={`rounded-md p-1.5 transition-all ${
								viewMode === 'grid'
									? 'bg-white text-cyan-600 shadow-sm'
									: 'text-zinc-400 hover:text-zinc-600'
							}`}
						>
							<Grid3X3 className="h-4 w-4" />
						</button>
						<button
							onClick={() => setViewMode('list')}
							className={`rounded-md p-1.5 transition-all ${
								viewMode === 'list'
									? 'bg-white text-cyan-600 shadow-sm'
									: 'text-zinc-400 hover:text-zinc-600'
							}`}
						>
							<List className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Server List/Grid */}
			{viewMode === 'grid' ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredServers.map((website, i) => (
						<WebsiteCard key={website.id} website={website} index={i} />
					))}

					{/* Create New Server Card */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: filteredServers.length * 0.05 }}
					>
						<motion.button
							whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.15 } }}
							onClick={() => setCreateDialogOpen(true)}
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
			) : (
				<div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
					<table className="w-full">
						<thead>
							<tr className="border-b border-zinc-100">
								<th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
									Server
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase">
									Updated
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-zinc-500 uppercase"></th>
							</tr>
						</thead>
						<tbody>
							{filteredServers.map((server, i) => (
								<motion.tr
									key={server.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: i * 0.05 }}
									className="border-b border-zinc-50 transition-colors last:border-0 hover:bg-zinc-50/50"
								>
									<td className="px-6 py-4">
										<Link
											href={`/dashboard/${server.id}`}
											className="flex items-center gap-3"
										>
											<div
												className={`flex h-9 w-9 items-center justify-center rounded-lg ${
													server.published
														? 'bg-gradient-to-br from-cyan-500 to-emerald-500'
														: 'bg-zinc-200'
												}`}
											>
												<Server className="h-4 w-4 text-white" />
											</div>
											<div>
												<p className="font-medium text-zinc-900 transition-colors hover:text-cyan-600">
													{server.name}
												</p>
												<p className="text-xs text-zinc-400">
													{server.subdomain}.minesites.net
												</p>
											</div>
										</Link>
									</td>
									<td className="px-6 py-4">
										<span
											className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
												server.published
													? 'bg-emerald-50 text-emerald-600'
													: 'bg-zinc-100 text-zinc-500'
											}`}
										>
											<span
												className={`h-1.5 w-1.5 rounded-full ${
													server.published
														? 'bg-emerald-500'
														: 'bg-zinc-400'
												}`}
											/>
											{server.published ? 'Live' : 'Draft'}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className="text-sm text-zinc-500">
											{formatRelativeTime(server.updatedAt)}
										</span>
									</td>
									<td className="px-6 py-4 text-right">
										<Link href={`/dashboard/${server.id}`}>
											<motion.button
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className="rounded-lg px-3 py-1.5 text-sm font-medium text-cyan-600 transition-colors hover:bg-cyan-50"
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
				<div className="py-16 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
						<Server className="h-8 w-8 text-zinc-300" />
					</div>
					<h3 className="mb-1 text-lg font-semibold text-zinc-900">No websites found</h3>
					<p className="mb-6 text-zinc-500">
						{searchQuery
							? 'Try a different search term'
							: 'Create your first website to get started'}
					</p>
					{!searchQuery && (
						<motion.button
							whileHover={{ scale: 1.02, y: -1 }}
							whileTap={{ scale: 0.98 }}
							onClick={() => setCreateDialogOpen(true)}
							className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-shadow hover:shadow-lg hover:shadow-cyan-200/50"
						>
							<Plus className="h-4 w-4" />
							Create Website
						</motion.button>
					)}
				</div>
			)}

			<CreateWebsiteDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
		</div>
	);
}
