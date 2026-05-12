'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Palette, Sparkles, Users, Zap } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui';

export default function HomePageV3() {
	return (
		<div className="bg-[#FAFAF9]">
			{/* Hero Section */}
			<section className="px-4 pt-32 pb-16">
				<div className="mx-auto max-w-4xl text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<div className="mb-8 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
							<Sparkles className="h-4 w-4" />
							Now in public beta
						</div>

						<h1 className="text-5xl leading-[1.05] font-bold tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl">
							Your server,
							<br />
							<span className="relative">
								your website
								<svg
									className="absolute -bottom-2 left-0 w-full"
									viewBox="0 0 300 12"
									fill="none"
								>
									<path
										d="M2 10C50 4 100 4 150 7C200 10 250 6 298 8"
										stroke="#06b6d4"
										strokeWidth="4"
										strokeLinecap="round"
									/>
								</svg>
							</span>
						</h1>

						<p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-zinc-600">
							Build a beautiful website for your Minecraft server. No design skills
							needed — just pick, customize, and publish.
						</p>

						<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Link href="/signup">
								<Button size="lg" className="px-8 text-base">
									Start building
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
							<span className="text-sm text-zinc-500">
								Free forever for basic sites
							</span>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Bento Grid */}
			<section className="px-4 py-16">
				<div className="mx-auto max-w-6xl">
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
					>
						{/* Large card - Preview */}
						<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-8 text-white lg:col-span-2 lg:row-span-2">
							<div className="relative z-10">
								<h3 className="mb-2 text-2xl font-bold">See it come to life</h3>
								<p className="max-w-sm text-cyan-100">
									Watch your changes in real-time as you build your perfect server
									page
								</p>
							</div>

							{/* Mini browser mockup */}
							<div className="relative mt-6">
								<div className="overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur">
									<div className="flex items-center gap-2 border-b border-white/10 bg-black/20 px-4 py-2">
										<div className="flex gap-1.5">
											<div className="h-2.5 w-2.5 rounded-full bg-white/30" />
											<div className="h-2.5 w-2.5 rounded-full bg-white/30" />
											<div className="h-2.5 w-2.5 rounded-full bg-white/30" />
										</div>
										<div className="flex-1 text-center text-xs text-white/60">
											myserver.minesites.net
										</div>
									</div>
									<div className="space-y-3 p-4">
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-lg bg-white/20" />
											<div className="space-y-1.5">
												<div className="h-3 w-24 rounded bg-white/30" />
												<div className="h-2 w-16 rounded bg-white/20" />
											</div>
										</div>
										<div className="grid grid-cols-3 gap-2">
											<div className="h-12 rounded-lg bg-white/10" />
											<div className="h-12 rounded-lg bg-white/10" />
											<div className="h-12 rounded-lg bg-white/10" />
										</div>
									</div>
								</div>
							</div>

							{/* Decorative circles */}
							<div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10" />
							<div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10" />
						</div>

						{/* Server status card */}
						<div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
								<Users className="h-6 w-6 text-emerald-600" />
							</div>
							<h3 className="text-lg font-semibold text-zinc-900">
								Live player count
							</h3>
							<p className="mt-2 text-sm text-zinc-500">
								Show real-time stats from your server automatically
							</p>
							<div className="mt-4 flex items-center gap-2">
								<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
									<span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
									156 online
								</span>
							</div>
						</div>

						{/* Speed card */}
						<div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
								<Zap className="h-6 w-6 text-amber-600" />
							</div>
							<h3 className="text-lg font-semibold text-zinc-900">
								Ready in minutes
							</h3>
							<p className="mt-2 text-sm text-zinc-500">
								Pick a template, add your details, and you're live
							</p>
						</div>

						{/* Customization card - wide */}
						<div className="rounded-3xl bg-zinc-900 p-6 text-white md:col-span-2 lg:col-span-2">
							<div className="flex flex-col gap-6 sm:flex-row sm:items-center">
								<div className="flex-1">
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
										<Palette className="h-6 w-6" />
									</div>
									<h3 className="text-lg font-semibold">Make it yours</h3>
									<p className="mt-2 text-sm text-zinc-400">
										Customize colors, fonts, and layout to match your server's
										brand
									</p>
								</div>
								<div className="flex gap-2">
									{[
										'bg-rose-500',
										'bg-amber-500',
										'bg-emerald-500',
										'bg-cyan-500',
										'bg-violet-500',
									].map((color, i) => (
										<div
											key={i}
											className={`h-8 w-8 rounded-full ${color} ${i === 3 ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''}`}
										/>
									))}
								</div>
							</div>
						</div>

						{/* Domain card */}
						<div className="rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white">
							<h3 className="mb-2 text-lg font-semibold">Free subdomain</h3>
							<p className="mb-4 text-sm text-violet-200">
								Get yourserver.minesites.net included
							</p>
							<div className="rounded-lg bg-white/20 px-3 py-2 font-mono text-sm backdrop-blur">
								epic.minesites.net
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Social proof */}
			<section className="px-4 py-16">
				<div className="mx-auto max-w-4xl text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<p className="mb-6 text-zinc-500">Trusted by server owners</p>
						<div className="flex flex-wrap justify-center gap-8 opacity-60">
							{['CraftWorld', 'PixelMC', 'SkyBlock+', 'MineCity', 'DragonRealm'].map(
								(name) => (
									<span key={name} className="text-xl font-bold text-zinc-400">
										{name}
									</span>
								),
							)}
						</div>
					</motion.div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="px-4 py-20">
				<div className="mx-auto max-w-4xl">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="relative overflow-hidden rounded-3xl bg-zinc-900 p-12 text-center text-white"
					>
						{/* Decorative elements */}
						<div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
						<div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

						<div className="relative">
							<h2 className="mb-4 text-3xl font-bold sm:text-4xl">
								Ready to get started?
							</h2>
							<p className="mx-auto mb-8 max-w-lg text-zinc-400">
								Create your server's website in minutes. No credit card required.
							</p>
							<Link href="/signup">
								<Button size="lg" className="px-8 text-base">
									Create your site
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
