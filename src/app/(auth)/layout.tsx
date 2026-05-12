'use client';

import { motion } from 'framer-motion';
import { BarChart3, Layers, Zap } from 'lucide-react';

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-white">
			{/* Animated background */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-white to-emerald-50" />
				<motion.div
					animate={{
						scale: [1, 1.2, 1],
						x: [0, 30, 0],
						y: [0, -20, 0],
					}}
					transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
					className="absolute -top-20 -left-20 h-[400px] w-[400px] rounded-full bg-cyan-200/30 blur-3xl"
				/>
				<motion.div
					animate={{
						scale: [1.2, 1, 1.2],
						x: [0, -40, 0],
						y: [0, 30, 0],
					}}
					transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
					className="absolute -right-20 -bottom-20 h-[500px] w-[500px] rounded-full bg-emerald-200/30 blur-3xl"
				/>
				<motion.div
					animate={{
						scale: [1, 1.3, 1],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
					className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-100/20 blur-3xl"
				/>
			</div>

			<div className="relative flex min-h-screen">
				{/* Left side - Branding (hidden on mobile) */}
				<div className="hidden flex-col justify-between p-12 lg:flex lg:w-[45%] xl:w-[40%] xl:p-16">
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<Link href="/" className="inline-block">
							<span className="font-display text-2xl font-bold tracking-tight text-zinc-900">
								Mine
								<span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
									Sites
								</span>
							</span>
						</Link>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="space-y-6"
					>
						<h1 className="font-display text-4xl leading-[1.1] font-extrabold tracking-tight text-zinc-900 xl:text-5xl">
							Beautiful websites
							<br />
							<span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
								for Minecraft servers
							</span>
						</h1>
						<p className="max-w-sm text-base leading-relaxed text-zinc-500">
							Create stunning landing pages in minutes. No coding required.
						</p>

						{/* Features */}
						<div className="space-y-4 pt-6">
							{[
								{
									icon: Layers,
									text: 'Drag & drop builder',
									color: 'from-cyan-500 to-blue-500',
								},
								{
									icon: BarChart3,
									text: 'Live server status',
									color: 'from-violet-500 to-purple-500',
								},
								{
									icon: Zap,
									text: 'Instant publishing',
									color: 'from-emerald-500 to-teal-500',
								},
							].map((feature, i) => (
								<motion.div
									key={feature.text}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
									className="flex items-center gap-3"
								>
									<div
										className={`h-10 w-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
									>
										<feature.icon className="h-5 w-5 text-white" />
									</div>
									<span className="text-sm font-medium text-zinc-700">
										{feature.text}
									</span>
								</motion.div>
							))}
						</div>
					</motion.div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.6 }}
						className="text-sm text-zinc-400"
					>
						Trusted by 1,000+ server owners
					</motion.p>
				</div>

				{/* Right side - Form */}
				<div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						transition={{ duration: 0.5 }}
						className="w-full max-w-md rounded-2xl border border-zinc-100 bg-white p-8 shadow-xl shadow-zinc-200/50 sm:p-10"
					>
						{children}
					</motion.div>
				</div>
			</div>
		</div>
	);
}
