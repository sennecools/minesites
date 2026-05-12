'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

function DiscordIcon({ className }: { className?: string }) {
	return (
		<svg className={className} fill="currentColor" viewBox="0 0 24 24">
			<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
		</svg>
	);
}

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			/>
		</svg>
	);
}

export default function SignupPage() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [acceptTerms, setAcceptTerms] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError('');

		if (password !== confirmPassword) {
			setError("Passwords don't match");
			return;
		}

		if (password.length < 8) {
			setError('Password must be at least 8 characters');
			return;
		}

		if (!acceptTerms) {
			setError('You must accept the Terms of Service');
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || 'Something went wrong');
				setIsLoading(false);
				return;
			}

			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError('Account created but sign in failed. Please try logging in.');
				setIsLoading(false);
			} else {
				router.push('/dashboard');
			}
		} catch {
			setError('Something went wrong. Please try again.');
			setIsLoading(false);
		}
	}

	return (
		<>
			{/* Header */}
			<div className="mb-8 text-center">
				<Link href="/" className="mb-6 inline-block lg:hidden">
					<span className="font-display text-2xl font-bold tracking-tight text-zinc-900">
						Mine
						<span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
							Sites
						</span>
					</span>
				</Link>
				<h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900">
					Create an account
				</h1>
				<p className="mt-2 text-sm text-zinc-500">Start building for free</p>
			</div>

			{/* OAuth Buttons */}
			<div className="mb-6 grid grid-cols-2 gap-3">
				<motion.button
					type="button"
					onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
					whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
					whileTap={{ scale: 0.98 }}
					className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors duration-150 hover:border-zinc-300 hover:bg-zinc-50"
				>
					<GoogleIcon className="h-4 w-4" />
					Google
				</motion.button>
				<motion.button
					type="button"
					onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
					whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
					whileTap={{ scale: 0.98 }}
					className="flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#4752C4]"
				>
					<DiscordIcon className="h-4 w-4" />
					Discord
				</motion.button>
			</div>

			{/* Divider */}
			<div className="relative my-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-zinc-200" />
				</div>
				<div className="relative flex justify-center">
					<span className="bg-white px-3 text-xs tracking-wider text-zinc-400 uppercase">
						or continue with email
					</span>
				</div>
			</div>

			{/* Email/Password Form */}
			<form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
						>
							{error}
						</motion.div>
					)}
				</AnimatePresence>

				<div className="space-y-1.5">
					<label htmlFor="signup-email" className="text-sm font-medium text-zinc-700">
						Email
					</label>
					<input
						id="signup-email"
						name="email"
						type="email"
						autoComplete="username email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-all duration-150 placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
					/>
				</div>

				<div className="space-y-1.5">
					<label htmlFor="signup-password" className="text-sm font-medium text-zinc-700">
						Password
					</label>
					<div className="relative">
						<input
							id="signup-password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							autoComplete="new-password"
							placeholder="At least 8 characters"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 pr-10 text-sm text-zinc-900 transition-all duration-150 placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
							required
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors duration-150 hover:text-zinc-600"
							tabIndex={-1}
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
				</div>

				<div className="space-y-1.5">
					<label
						htmlFor="signup-confirm-password"
						className="text-sm font-medium text-zinc-700"
					>
						Confirm password
					</label>
					<div className="relative">
						<input
							id="signup-confirm-password"
							name="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							autoComplete="new-password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 pr-10 text-sm text-zinc-900 transition-all duration-150 placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none"
							required
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors duration-150 hover:text-zinc-600"
							tabIndex={-1}
						>
							{showConfirmPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
						</button>
					</div>
				</div>

				<label className="group flex cursor-pointer items-start gap-3">
					<div className="relative mt-0.5 flex items-center justify-center">
						<input
							type="checkbox"
							name="terms"
							checked={acceptTerms}
							onChange={(e) => setAcceptTerms(e.target.checked)}
							className="peer sr-only"
						/>
						<motion.div
							whileTap={{ scale: 0.9 }}
							className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-zinc-300 transition-all duration-150 group-hover:border-zinc-400 peer-checked:border-cyan-500 peer-checked:bg-cyan-500 peer-checked:group-hover:border-cyan-500"
						>
							<Check className="h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
						</motion.div>
					</div>
					<span className="text-sm leading-tight text-zinc-600">
						I agree to the{' '}
						<Link
							href="/terms"
							className="text-cyan-600 transition-colors hover:text-cyan-500"
						>
							Terms
						</Link>{' '}
						and{' '}
						<Link
							href="/privacy"
							className="text-cyan-600 transition-colors hover:text-cyan-500"
						>
							Privacy Policy
						</Link>
					</span>
				</label>

				<motion.button
					type="submit"
					disabled={isLoading}
					whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
					whileTap={{ scale: 0.99 }}
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-3 text-sm font-medium text-white transition-shadow duration-150 hover:shadow-lg hover:shadow-cyan-200/50 disabled:cursor-not-allowed disabled:opacity-70"
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Creating account...
						</>
					) : (
						<>
							Create account
							<ArrowRight className="h-4 w-4" />
						</>
					)}
				</motion.button>
			</form>

			{/* Footer */}
			<p className="mt-6 text-center text-sm text-zinc-500">
				Already have an account?{' '}
				<Link
					href="/login"
					className="font-medium text-cyan-600 transition-colors hover:text-cyan-500"
				>
					Sign in
				</Link>
			</p>
		</>
	);
}
