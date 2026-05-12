'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Globe, Server, Shield, Sparkles, Zap } from 'lucide-react';

import { useState } from 'react';

import Link from 'next/link';

// Fun button with click effect for popular plan
function FunButton({
	children,
	href,
	className = '',
}: {
	children: React.ReactNode;
	href: string;
	className?: string;
}) {
	const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
	const [isPressed, setIsPressed] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const newParticles = Array.from({ length: 8 }, (_, i) => ({
			id: Date.now() + i,
			x,
			y,
		}));
		setParticles(newParticles);
		setIsPressed(true);

		setTimeout(() => setParticles([]), 600);
		setTimeout(() => setIsPressed(false), 150);

		// Navigate after animation plays
		setTimeout(() => {
			window.location.href = href;
		}, 300);
	};

	return (
		<Link href={href} onClick={handleClick}>
			<motion.button
				animate={isPressed ? { scale: [1, 0.95, 1.02, 1] } : {}}
				transition={{ duration: 0.3 }}
				whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.15 } }}
				className={`relative overflow-visible ${className}`}
			>
				{children}
				<AnimatePresence>
					{particles.map((particle, i) => (
						<motion.span
							key={particle.id}
							initial={{ opacity: 1, scale: 0, x: particle.x - 4, y: particle.y - 4 }}
							animate={{
								opacity: 0,
								scale: 1,
								x: particle.x + Math.cos((i * 45 * Math.PI) / 180) * 50 - 4,
								y: particle.y + Math.sin((i * 45 * Math.PI) / 180) * 50 - 4,
							}}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5, ease: 'easeOut' }}
							className="pointer-events-none absolute z-50 h-2 w-2 rounded-full bg-white"
							style={{ boxShadow: '0 0 6px 2px rgba(255,255,255,0.8)' }}
						/>
					))}
				</AnimatePresence>
				<AnimatePresence>
					{isPressed && (
						<motion.span
							initial={{ opacity: 0.4, scale: 0.8 }}
							animate={{ opacity: 0, scale: 1.8 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4 }}
							className="pointer-events-none absolute inset-0 z-40 rounded-xl bg-white/30"
						/>
					)}
				</AnimatePresence>
			</motion.button>
		</Link>
	);
}

const plans = [
	{
		name: 'Free',
		price: '$0',
		period: '/forever',
		description: 'Get started with the basics',
		features: [
			'1 server site',
			'Basic templates',
			'minesites.net subdomain',
			'Live player count',
			'Community support',
		],
		cta: 'Get started',
		href: '/signup',
	},
	{
		name: 'Starter',
		price: '$5',
		period: '/month',
		description: 'For growing servers',
		features: [
			'3 server sites',
			'All templates',
			'Custom subdomain',
			'Remove MineSites branding',
			'Basic analytics',
			'Email support',
		],
		cta: 'Get started',
		href: '/signup?plan=starter',
	},
	{
		name: 'Pro',
		price: '$10',
		period: '/month',
		description: 'For serious server owners',
		popular: true,
		features: [
			'10 server sites',
			'All templates + early access',
			'Custom domain',
			'Advanced analytics',
			'Custom CSS',
			'Priority support',
			'Discord widget',
			'Announcements',
		],
		cta: 'Get started',
		href: '/signup?plan=pro',
	},
	{
		name: 'Network',
		price: '$25',
		period: '/month',
		description: 'For networks and communities',
		features: [
			'Unlimited server sites',
			'Everything in Pro',
			'White-label branding',
			'API access',
			'Dedicated support',
			'Custom integrations',
			'Team members',
			'SLA guarantee',
		],
		cta: 'Get started',
		href: '/signup?plan=network',
	},
];

const includedFeatures = [
	{ icon: Shield, label: 'SSL certificate' },
	{ icon: Globe, label: 'Fast global CDN' },
	{ icon: Zap, label: 'Automatic updates' },
	{ icon: Clock, label: '99.9% uptime' },
	{ icon: Server, label: 'DDoS protection' },
];

export default function PricingPage() {
	return (
		<div className="min-h-screen overflow-hidden pt-32 pb-24">
			{/* Animated Background */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-gradient-to-b from-cyan-50/50 via-white to-white" />

				{/* Animated blobs */}
				<motion.div
					className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-cyan-100/40 blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						x: [0, 30, 0],
						y: [0, -20, 0],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
				<motion.div
					className="absolute top-40 right-1/4 h-80 w-80 rounded-full bg-emerald-100/40 blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						x: [0, -40, 0],
						y: [0, 30, 0],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
				<motion.div
					className="absolute bottom-40 left-1/3 h-72 w-72 rounded-full bg-violet-100/30 blur-3xl"
					animate={{
						scale: [1, 1.3, 1],
						x: [0, 20, 0],
					}}
					transition={{
						duration: 12,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
			</div>

			<div className="mx-auto max-w-6xl px-4">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-16 text-center"
				>
					<motion.span
						className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-700"
						whileHover={{ scale: 1.05 }}
					>
						<motion.span
							animate={{ rotate: [0, 15, -15, 0] }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<Sparkles className="h-3.5 w-3.5" />
						</motion.span>
						Simple pricing
					</motion.span>
					<h1 className="font-display text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
						Choose your plan
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-lg text-zinc-500">
						Start free and upgrade as your server grows. All plans include SSL and fast
						hosting.
					</p>
				</motion.div>

				{/* Pricing Cards */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
					{plans.map((plan, index) => (
						<motion.div
							key={plan.name}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1, duration: 0.5 }}
							whileHover={{
								y: -8,
								transition: { duration: 0.2 },
							}}
							className={`relative flex flex-col rounded-2xl border bg-white p-6 transition-shadow ${
								plan.popular
									? 'border-cyan-500 shadow-lg shadow-cyan-100'
									: 'border-zinc-200 hover:shadow-xl hover:shadow-zinc-200/50'
							}`}
						>
							{plan.popular && (
								<motion.div
									className="absolute inset-x-0 -top-4 flex justify-center"
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 0.3 }}
								>
									<motion.span
										className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg"
										animate={{
											boxShadow: [
												'0 10px 15px -3px rgba(6, 182, 212, 0.3)',
												'0 10px 25px -3px rgba(6, 182, 212, 0.5)',
												'0 10px 15px -3px rgba(6, 182, 212, 0.3)',
											],
										}}
										transition={{ duration: 2, repeat: Infinity }}
									>
										Most popular
									</motion.span>
								</motion.div>
							)}

							<div className="mb-6 pt-2">
								<h3 className="text-lg font-semibold text-zinc-900">{plan.name}</h3>
								<div className="mt-4 flex items-baseline gap-1">
									<motion.span
										className="font-display text-5xl font-extrabold text-zinc-900"
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: index * 0.1 + 0.2 }}
									>
										{plan.price}
									</motion.span>
									<span className="text-sm text-zinc-500">{plan.period}</span>
								</div>
								<p className="mt-3 text-sm text-zinc-500">{plan.description}</p>
							</div>

							<ul className="mb-8 flex-1 space-y-3">
								{plan.features.map((feature, featureIndex) => (
									<motion.li
										key={feature}
										className="flex items-start gap-3"
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{
											delay: index * 0.1 + featureIndex * 0.05 + 0.3,
										}}
									>
										<motion.div
											className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-cyan-100"
											whileHover={{
												scale: 1.2,
												backgroundColor: 'rgb(34 211 238 / 0.3)',
											}}
										>
											<Check className="h-3 w-3 text-cyan-600" />
										</motion.div>
										<span className="text-sm text-zinc-600">{feature}</span>
									</motion.li>
								))}
							</ul>

							{plan.popular ? (
								<FunButton
									href={plan.href}
									className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-200/50"
								>
									{plan.cta}
									<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
								</FunButton>
							) : (
								<Link href={plan.href}>
									<motion.button
										whileHover={{
											scale: 1.02,
											y: -2,
											transition: { duration: 0.15 },
										}}
										whileTap={{ scale: 0.98 }}
										className="group flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:bg-zinc-200"
									>
										{plan.cta}
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</motion.button>
								</Link>
							)}
						</motion.div>
					))}
				</div>

				{/* All plans include */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
					className="mt-20 text-center"
				>
					<h2 className="font-display mb-8 text-2xl font-bold text-zinc-900">
						All plans include
					</h2>
					<div className="flex flex-wrap justify-center gap-4">
						{includedFeatures.map((item, index) => (
							<motion.div
								key={item.label}
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								whileHover={{ scale: 1.05, y: -2 }}
								className="flex cursor-default items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-cyan-200 hover:shadow-md"
							>
								<motion.div whileHover={{ rotate: 10 }} className="text-cyan-500">
									<item.icon className="h-4 w-4" />
								</motion.div>
								<span className="text-sm font-medium text-zinc-600">
									{item.label}
								</span>
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* FAQ teaser */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.3 }}
					whileHover={{ scale: 1.01 }}
					className="mt-16 rounded-2xl border border-zinc-100 bg-gradient-to-br from-zinc-50 to-cyan-50/30 p-8 text-center"
				>
					<motion.div
						animate={{ y: [0, -3, 0] }}
						transition={{ duration: 3, repeat: Infinity }}
					>
						<h3 className="mb-2 font-semibold text-zinc-900">Have questions?</h3>
						<p className="mb-4 text-zinc-500">
							We&apos;re here to help you choose the right plan for your server.
						</p>
					</motion.div>
					<Link href="/support">
						<motion.button
							whileHover={{ scale: 1.05, y: -2 }}
							whileTap={{ scale: 0.98 }}
							className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:border-cyan-300 hover:shadow-md"
						>
							Contact support
						</motion.button>
					</Link>
				</motion.div>
			</div>
		</div>
	);
}
