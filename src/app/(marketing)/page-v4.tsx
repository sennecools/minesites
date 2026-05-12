'use client';

import { motion } from 'framer-motion';
import { Brush, ChevronRight, Globe, Play, Server, Users } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui';

const showcaseServers = [
	{
		name: 'SkyBlock Paradise',
		type: 'Skyblock',
		players: '1.2k',
		color: 'from-emerald-500 to-teal-600',
		icon: '🏝️',
	},
	{
		name: "Dragon's Realm",
		type: 'Survival',
		players: '847',
		color: 'from-orange-500 to-red-600',
		icon: '🐉',
	},
	{
		name: 'PvP Masters',
		type: 'Factions',
		players: '2.1k',
		color: 'from-purple-500 to-indigo-600',
		icon: '⚔️',
	},
];

export default function HomePage() {
	return (
		<div className="bg-zinc-950">
			{/* Hero Section */}
			<section className="relative flex min-h-screen items-center overflow-hidden">
				{/* Gradient background */}
				<div className="absolute inset-0">
					<div className="absolute inset-0 bg-gradient-to-b from-emerald-950/50 via-zinc-950 to-zinc-950" />
					<div className="absolute top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
				</div>

				{/* Floating blocks decoration */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<motion.div
						animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
						transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
						className="absolute top-[20%] left-[10%] h-16 w-16 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10"
					/>
					<motion.div
						animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
						transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
						className="absolute top-[30%] right-[15%] h-12 w-12 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-orange-600/10"
					/>
					<motion.div
						animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
						transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
						className="absolute bottom-[30%] left-[20%] h-10 w-10 rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-cyan-600/10"
					/>
					<motion.div
						animate={{ y: [0, 20, 0], rotate: [0, -3, 0] }}
						transition={{
							duration: 8,
							repeat: Infinity,
							ease: 'easeInOut',
							delay: 0.5,
						}}
						className="absolute top-[50%] right-[8%] h-14 w-14 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-violet-600/10"
					/>
				</div>

				<div className="relative mx-auto max-w-6xl px-4 py-24">
					<div className="mx-auto max-w-3xl text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
								<span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
								Now in public beta
							</div>

							<h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
								Give your server
								<br />
								<span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
									a home online
								</span>
							</h1>

							<p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-zinc-400">
								Create a stunning website for your Minecraft server. Show off your
								community, features, and get more players joining.
							</p>

							<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
								<Link href="/signup">
									<Button
										size="lg"
										className="bg-emerald-500 px-8 text-base hover:bg-emerald-600"
									>
										Start building free
										<ChevronRight className="ml-1 h-4 w-4" />
									</Button>
								</Link>
								<button className="flex items-center gap-2 px-6 py-3 text-zinc-300 transition-colors hover:text-white">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
										<Play className="ml-0.5 h-4 w-4" />
									</div>
									Watch demo
								</button>
							</div>
						</motion.div>

						{/* Server showcase cards */}
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3"
						>
							{showcaseServers.map((server, i) => (
								<motion.div
									key={server.name}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
									className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 transition-all hover:-translate-y-1 hover:border-zinc-700"
								>
									<div
										className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${server.color} opacity-0 transition-opacity group-hover:opacity-5`}
									/>
									<div className="relative">
										<div className="mb-3 flex items-center gap-3">
											<div
												className={`h-10 w-10 rounded-xl bg-gradient-to-br ${server.color} flex items-center justify-center text-lg`}
											>
												{server.icon}
											</div>
											<div className="text-left">
												<div className="font-semibold text-white">
													{server.name}
												</div>
												<div className="text-xs text-zinc-500">
													{server.type}
												</div>
											</div>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-xs text-zinc-500">
												Online now
											</span>
											<span className="inline-flex items-center gap-1.5 text-sm text-emerald-400">
												<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
												{server.players}
											</span>
										</div>
									</div>
								</motion.div>
							))}
						</motion.div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="border-t border-zinc-800/50 py-24">
				<div className="mx-auto max-w-6xl px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-16 text-center"
					>
						<h2 className="text-3xl font-bold text-white sm:text-4xl">
							Everything your server needs
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-zinc-400">
							Built specifically for Minecraft communities. No coding required.
						</p>
					</motion.div>

					<div className="grid gap-6 md:grid-cols-2">
						{/* Large feature card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-8 md:row-span-2"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							<div className="relative">
								<div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
									<Server className="h-7 w-7 text-emerald-400" />
								</div>
								<h3 className="mb-3 text-2xl font-bold text-white">
									Live server status
								</h3>
								<p className="mb-8 text-zinc-400">
									Display real-time player counts, server version, and online
									status. Updates automatically.
								</p>

								{/* Mock server status */}
								<div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
									<div className="mb-4 flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
												<span>⚔️</span>
											</div>
											<div>
												<div className="font-medium text-white">
													play.myserver.net
												</div>
												<div className="text-xs text-zinc-500">
													Minecraft 1.21
												</div>
											</div>
										</div>
										<div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
											Online
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="h-2 flex-1 rounded-full bg-zinc-800">
											<div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
										</div>
										<span className="text-sm text-zinc-400">156/200</span>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Smaller feature cards */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.1 }}
							className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6"
						>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
								<Brush className="h-6 w-6 text-amber-400" />
							</div>
							<h3 className="mb-2 text-lg font-semibold text-white">
								Easy customization
							</h3>
							<p className="text-sm text-zinc-400">
								Drag-and-drop editor. Change colors, fonts, and layout with a few
								clicks.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.2 }}
							className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6"
						>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
								<Globe className="h-6 w-6 text-blue-400" />
							</div>
							<h3 className="mb-2 text-lg font-semibold text-white">
								Free subdomain
							</h3>
							<p className="text-sm text-zinc-400">
								Get yourserver.minesites.net for free, or connect your own custom
								domain.
							</p>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Social proof */}
			<section className="border-t border-zinc-800/50 py-16">
				<div className="mx-auto max-w-6xl px-4">
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						className="flex flex-col items-center justify-between gap-8 md:flex-row"
					>
						<div className="flex items-center gap-8">
							<div className="text-center">
								<div className="text-3xl font-bold text-white">500+</div>
								<div className="text-sm text-zinc-500">Servers</div>
							</div>
							<div className="h-10 w-px bg-zinc-800" />
							<div className="text-center">
								<div className="text-3xl font-bold text-white">50k+</div>
								<div className="text-sm text-zinc-500">Players reached</div>
							</div>
							<div className="hidden h-10 w-px bg-zinc-800 sm:block" />
							<div className="hidden text-center sm:block">
								<div className="text-3xl font-bold text-white">4.9</div>
								<div className="text-sm text-zinc-500">Avg. rating</div>
							</div>
						</div>
						<div className="flex -space-x-3">
							{[...Array(5)].map((_, i) => (
								<div
									key={i}
									className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-950 bg-gradient-to-br from-zinc-700 to-zinc-800 text-xs"
								>
									{['🎮', '⚔️', '🏰', '🐉', '🌟'][i]}
								</div>
							))}
							<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-zinc-950 bg-emerald-500/20 text-xs font-medium text-emerald-400">
								+99
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24">
				<div className="mx-auto max-w-4xl px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="relative overflow-hidden rounded-3xl"
					>
						{/* Gradient background */}
						<div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600" />
						<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />

						<div className="relative px-8 py-16 text-center">
							<h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
								Ready to grow your community?
							</h2>
							<p className="mx-auto mb-8 max-w-lg text-emerald-100">
								Join hundreds of server owners who already trust MineSites for their
								online presence.
							</p>
							<Link href="/signup">
								<Button
									size="lg"
									className="bg-white px-8 text-base text-emerald-600 hover:bg-emerald-50"
								>
									Get started for free
									<ChevronRight className="ml-1 h-4 w-4" />
								</Button>
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
