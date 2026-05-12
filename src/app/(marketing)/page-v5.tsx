'use client';

import { motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';

import { useState } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui';

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const copy = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button onClick={copy} className="text-zinc-400 transition-colors hover:text-white">
			{copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
		</button>
	);
}

export default function HomePage() {
	return (
		<div className="min-h-screen bg-[#0f0f0f]">
			{/* Hero */}
			<section className="px-4 pt-32 pb-20">
				<div className="mx-auto max-w-5xl">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center"
					>
						{/* Fun badge */}
						<div className="mb-8 inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1.5 text-sm text-yellow-400">
							<span>✨</span>
							<span>Stop sending people to a boring IP address</span>
						</div>

						<h1 className="text-5xl leading-[1.05] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
							Your server is cool.
							<br />
							<span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
								Your website should be too.
							</span>
						</h1>

						<p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400 sm:text-xl">
							Build a website that matches your server's energy. No coding, no
							designers, no headaches.
						</p>

						<div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
							<Link href="/signup">
								<Button
									size="lg"
									className="bg-white px-8 text-base font-semibold text-black hover:bg-zinc-200"
								>
									Build yours free →
								</Button>
							</Link>
							<span className="text-sm text-zinc-600">takes like 5 mins</span>
						</div>
					</motion.div>

					{/* Example sites showcase */}
					<motion.div
						initial={{ opacity: 0, y: 40 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="mt-20"
					>
						{/* Browser mockup */}
						<div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-2xl shadow-black/50">
							<div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
								<div className="flex gap-1.5">
									<div className="h-3 w-3 rounded-full bg-zinc-700" />
									<div className="h-3 w-3 rounded-full bg-zinc-700" />
									<div className="h-3 w-3 rounded-full bg-zinc-700" />
								</div>
								<div className="flex flex-1 justify-center">
									<div className="flex items-center gap-2 rounded-md bg-zinc-800 px-3 py-1 text-sm text-zinc-400">
										<span className="text-green-400">●</span>
										epicpvp.minesites.net
									</div>
								</div>
							</div>

							{/* Site preview */}
							<div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/30 p-6 sm:p-8">
								<div className="flex flex-col items-start gap-6 sm:flex-row">
									{/* Server info */}
									<div className="flex-1">
										<div className="mb-4 flex items-center gap-4">
											<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-2xl shadow-lg shadow-purple-500/20">
												⚔️
											</div>
											<div>
												<h3 className="text-2xl font-bold text-white">
													EpicPvP
												</h3>
												<p className="text-zinc-500">
													The #1 PvP experience
												</p>
											</div>
										</div>

										<div className="mb-6 flex flex-wrap gap-2">
											<span className="rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
												🟢 1,247 playing
											</span>
											<span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-400">
												1.8 - 1.21
											</span>
											<span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-400">
												Kit PvP
											</span>
										</div>

										{/* IP Copy */}
										<div className="inline-flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2">
											<code className="font-mono text-sm text-zinc-300">
												play.epicpvp.net
											</code>
											<CopyButton text="play.epicpvp.net" />
										</div>
									</div>

									{/* Game modes */}
									<div className="grid grid-cols-2 gap-3 sm:w-64">
										{[
											{
												name: 'Kit PvP',
												icon: '⚔️',
												color: 'from-red-500/20 to-orange-500/10',
											},
											{
												name: 'Duels',
												icon: '🤺',
												color: 'from-blue-500/20 to-cyan-500/10',
											},
											{
												name: 'UHC',
												icon: '💀',
												color: 'from-purple-500/20 to-pink-500/10',
											},
											{
												name: 'Ranked',
												icon: '🏆',
												color: 'from-yellow-500/20 to-amber-500/10',
											},
										].map((mode) => (
											<div
												key={mode.name}
												className={`rounded-xl bg-gradient-to-br p-3 ${mode.color} border border-white/5`}
											>
												<span className="mb-1 block text-lg">
													{mode.icon}
												</span>
												<span className="text-sm font-medium text-white">
													{mode.name}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Why section - casual tone */}
			<section className="border-t border-zinc-800/50 px-4 py-20">
				<div className="mx-auto max-w-4xl">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-16 text-center"
					>
						<h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
							Why bother with a website?
						</h2>
						<p className="text-lg text-zinc-400">Fair question. Here's the deal:</p>
					</motion.div>

					<div className="grid gap-4">
						{[
							{
								emoji: '🔍',
								title: 'Players can actually find you',
								desc: 'Show up on Google instead of being buried in server lists',
							},
							{
								emoji: '💅',
								title: 'Look legit',
								desc: 'A real website hits different than a Discord invite link',
							},
							{
								emoji: '📊',
								title: 'Show off your stats',
								desc: 'Live player count, server status, all updating automatically',
							},
							{
								emoji: '🎨',
								title: 'Match your vibe',
								desc: 'Your server has a brand. Your website should too.',
							},
						].map((item, i) => (
							<motion.div
								key={item.title}
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: i * 0.1 }}
								className="flex items-start gap-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-700/50"
							>
								<span className="text-2xl">{item.emoji}</span>
								<div>
									<h3 className="mb-1 font-semibold text-white">{item.title}</h3>
									<p className="text-sm text-zinc-500">{item.desc}</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* How it works - super simple */}
			<section className="border-t border-zinc-800/50 px-4 py-20">
				<div className="mx-auto max-w-4xl text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
					>
						<h2 className="mb-12 text-3xl font-bold text-white sm:text-4xl">
							Stupid simple
						</h2>

						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
							{[
								{ step: '1', text: 'Pick a template' },
								{ step: '2', text: 'Add your stuff' },
								{ step: '3', text: 'Hit publish' },
							].map((item, i) => (
								<div key={item.step} className="flex items-center gap-4 sm:gap-8">
									<div className="flex items-center gap-3">
										<span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-lg font-bold text-white">
											{item.step}
										</span>
										<span className="font-medium text-zinc-300">
											{item.text}
										</span>
									</div>
									{i < 2 && (
										<span className="hidden text-zinc-700 sm:block">→</span>
									)}
								</div>
							))}
						</div>

						<p className="mt-8 text-zinc-500">That's it. No tutorials needed.</p>
					</motion.div>
				</div>
			</section>

			{/* CTA */}
			<section className="px-4 py-20">
				<div className="mx-auto max-w-2xl text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 p-8 sm:p-12"
					>
						<h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
							Ready to upgrade from
							<br />
							<span className="text-zinc-500 line-through">play.myserver.net</span>
							<span className="text-green-400"> ?</span>
						</h2>
						<p className="mb-8 text-zinc-400">Free tier. No credit card. No BS.</p>
						<Link href="/signup">
							<Button
								size="lg"
								className="bg-white px-8 text-base font-semibold text-black hover:bg-zinc-200"
							>
								Let's go →
							</Button>
						</Link>
					</motion.div>
				</div>
			</section>
		</div>
	);
}
