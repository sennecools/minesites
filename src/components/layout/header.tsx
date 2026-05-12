'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { useState } from 'react';

import Link from 'next/link';

// Fun button with click effect
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

		const newParticles = Array.from({ length: 6 }, (_, i) => ({
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
				whileHover={{ scale: 1.05, y: -1, transition: { duration: 0.15 } }}
				className={`relative overflow-visible ${className}`}
			>
				{children}
				<AnimatePresence>
					{particles.map((particle, i) => (
						<motion.span
							key={particle.id}
							initial={{ opacity: 1, scale: 0, x: particle.x - 3, y: particle.y - 3 }}
							animate={{
								opacity: 0,
								scale: 1,
								x: particle.x + Math.cos((i * 60 * Math.PI) / 180) * 40 - 3,
								y: particle.y + Math.sin((i * 60 * Math.PI) / 180) * 40 - 3,
							}}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4, ease: 'easeOut' }}
							className="pointer-events-none absolute z-50 h-1.5 w-1.5 rounded-full bg-white"
							style={{ boxShadow: '0 0 5px 2px rgba(255,255,255,0.8)' }}
						/>
					))}
				</AnimatePresence>
				<AnimatePresence>
					{isPressed && (
						<motion.span
							initial={{ opacity: 0.4, scale: 0.8 }}
							animate={{ opacity: 0, scale: 1.8 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.35 }}
							className="pointer-events-none absolute inset-0 z-40 rounded-lg bg-white/30"
						/>
					)}
				</AnimatePresence>
			</motion.button>
		</Link>
	);
}

export function Header() {
	return (
		<motion.header
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="fixed top-0 right-0 left-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-md"
		>
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2">
					<motion.span
						className="font-display text-xl font-bold text-zinc-900"
						whileHover={{ scale: 1.05 }}
						transition={{ type: 'spring', stiffness: 400 }}
					>
						Mine
						<span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
							Sites
						</span>
					</motion.span>
				</Link>

				<nav className="hidden items-center gap-8 md:flex">
					{[
						{ href: '/pricing', label: 'Pricing' },
						{ href: '/demo', label: 'Demo' },
						{ href: '/updates', label: 'Updates' },
					].map((link) => (
						<Link key={link.href} href={link.href}>
							<motion.span
								className="relative text-sm text-zinc-500 transition-colors hover:text-zinc-900"
								whileHover={{ y: -1 }}
							>
								{link.label}
								<motion.span
									className="absolute right-0 -bottom-1 left-0 h-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
									initial={{ scaleX: 0 }}
									whileHover={{ scaleX: 1 }}
									transition={{ duration: 0.2 }}
								/>
							</motion.span>
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-3">
					<Link href="/login">
						<motion.button
							whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
							whileTap={{ scale: 0.95 }}
							className="px-4 py-2 text-sm font-medium text-zinc-600 transition-colors duration-150 hover:text-zinc-900"
						>
							Log in
						</motion.button>
					</Link>
					<FunButton
						href="/signup"
						className="rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white transition-shadow duration-150 hover:shadow-lg hover:shadow-cyan-200/50"
					>
						Get started
					</FunButton>
				</div>
			</div>
		</motion.header>
	);
}
