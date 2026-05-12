'use client';

import { motion } from 'framer-motion';
import { BarChart3, Check, Globe, MessageCircle, Paintbrush } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui';

const features = [
	{
		title: 'Drag & Drop Builder',
		description: 'Build your site visually with our intuitive editor. No coding required.',
		icon: Paintbrush,
	},
	{
		title: 'Live Server Status',
		description: 'Display real-time player counts and server status automatically.',
		icon: BarChart3,
	},
	{
		title: 'Custom Domain',
		description: 'Get yourserver.minesites.net or connect your own domain.',
		icon: Globe,
	},
	{
		title: 'Discord Integration',
		description: 'Sign in with Discord and embed your community widget.',
		icon: MessageCircle,
	},
];

export default function HomePage() {
	return (
		<>
			{/* Hero Section */}
			<section className="relative flex min-h-[90vh] items-center overflow-hidden">
				{/* Background */}
				<div className="absolute inset-0 bg-slate-900">
					{/* Gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 via-slate-900 to-indigo-600/10" />

					{/* Abstract shapes */}
					<div className="absolute top-20 left-[10%] h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
					<div className="absolute top-40 right-[15%] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
					<div className="absolute bottom-20 left-[20%] h-80 w-80 rounded-full bg-blue-500/8 blur-3xl" />

					{/* Geometric shapes */}
					<div className="absolute top-32 right-[20%] h-24 w-24 rotate-12 rounded-2xl border border-white/5" />
					<div className="absolute top-[60%] left-[8%] h-16 w-16 -rotate-12 rounded-xl border border-white/5" />
					<div className="absolute right-[12%] bottom-32 h-20 w-20 rounded-full border border-white/5" />
					<div className="absolute top-[45%] right-[35%] h-12 w-12 rotate-45 rounded-lg bg-cyan-500/10" />
					<div className="absolute bottom-[40%] left-[15%] h-8 w-8 rounded-full bg-indigo-500/10" />
				</div>

				<div className="relative mx-auto max-w-6xl px-4 py-24">
					<div className="grid items-center gap-12 lg:grid-cols-2">
						{/* Left - Text */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-400">
								<span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
								Now in public beta
							</div>

							<h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
								Websites for
								<br />
								<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
									Minecraft servers
								</span>
							</h1>

							<p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
								Create a stunning landing page for your server in minutes. No coding
								needed. Just drag, drop, and publish.
							</p>

							<div className="mt-8 flex flex-wrap gap-4">
								<Link href="/signup">
									<Button size="lg">Start for free</Button>
								</Link>
								<Link href="/pricing">
									<Button
										size="lg"
										variant="secondary"
										className="border-white/10 bg-white/5 text-white hover:bg-white/10"
									>
										View pricing
									</Button>
								</Link>
							</div>

							<div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-emerald-400" />
									Free tier available
								</div>
								<div className="flex items-center gap-2">
									<Check className="h-4 w-4 text-emerald-400" />
									No credit card required
								</div>
							</div>
						</motion.div>

						{/* Right - Browser mockup */}
						<motion.div
							initial={{ opacity: 0, y: 40 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="relative"
						>
							{/* Browser window */}
							<div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50 shadow-2xl backdrop-blur">
								{/* Title bar */}
								<div className="flex items-center gap-3 border-b border-white/5 bg-slate-800/50 px-4 py-3">
									<div className="flex gap-2">
										<div className="h-3 w-3 rounded-full bg-slate-600" />
										<div className="h-3 w-3 rounded-full bg-slate-600" />
										<div className="h-3 w-3 rounded-full bg-slate-600" />
									</div>
									<div className="flex flex-1 justify-center">
										<div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-4 py-1.5 text-sm text-slate-400">
											<Globe className="h-3.5 w-3.5" />
											epiccraft.minesites.net
										</div>
									</div>
								</div>

								{/* Content */}
								<div className="space-y-4 p-6">
									{/* Hero section mockup */}
									<div className="rounded-xl border border-white/5 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 p-5">
										<div className="mb-4 flex items-center gap-3">
											<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
												<span className="text-xl">⚔️</span>
											</div>
											<div>
												<div className="font-semibold text-white">
													EpicCraft
												</div>
												<div className="text-sm text-slate-400">
													play.epiccraft.net
												</div>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-400">
												<span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
												247 online
											</div>
											<div className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-400">
												1.20.4
											</div>
										</div>
									</div>

									{/* Feature cards mockup */}
									<div className="grid grid-cols-2 gap-3">
										<div className="rounded-lg border border-white/5 bg-white/5 p-4">
											<div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
												<span className="text-sm">🏰</span>
											</div>
											<div className="text-sm font-medium text-white">
												Survival
											</div>
											<div className="mt-1 text-xs text-slate-500">
												Classic gameplay
											</div>
										</div>
										<div className="rounded-lg border border-white/5 bg-white/5 p-4">
											<div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
												<span className="text-sm">⚔️</span>
											</div>
											<div className="text-sm font-medium text-white">
												PvP Arena
											</div>
											<div className="mt-1 text-xs text-slate-500">
												Competitive battles
											</div>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="border-t border-white/5 bg-slate-900 py-24">
				<div className="mx-auto max-w-6xl px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="text-center"
					>
						<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
							Everything you need
						</h2>
						<p className="mx-auto mt-4 max-w-2xl text-slate-400">
							Built specifically for Minecraft server owners who want a professional
							online presence
						</p>
					</motion.div>

					<div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{features.map((feature, index) => (
							<motion.div
								key={feature.title}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<div className="h-full rounded-2xl border border-white/5 bg-white/5 p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.07]">
									<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
										<feature.icon className="h-5 w-5" />
									</div>
									<h3 className="text-base font-semibold text-white">
										{feature.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-slate-400">
										{feature.description}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="relative overflow-hidden py-24">
				<div className="absolute inset-0 bg-slate-900">
					<div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
				</div>

				<div className="relative mx-auto max-w-3xl px-4 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
							Ready to stand out?
						</h2>
						<p className="mt-4 text-lg text-slate-400">
							Join server owners who&apos;ve already upgraded their online presence
						</p>
						<div className="mt-10">
							<Link href="/signup">
								<Button size="lg">Create your site</Button>
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</>
	);
}
