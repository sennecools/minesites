'use client';

import { isLightColor } from '@/components/preview/types';
import type { HeroSettings, SectionRenderProps } from '@/types/sections';

/**
 * Validates a background image URL before embedding in a CSS url() call.
 * Rejects non-http/https protocols and malformed values to prevent CSS injection.
 */
function safeBackgroundUrl(url: string): string | undefined {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return undefined;
		return url;
	} catch {
		return undefined;
	}
}

/**
 * HeroRender — extracted from preview-client.tsx PreviewHero (Phase 1).
 * Same markup, same behavior. Player count now sourced from serverData prop.
 *
 * Per Phase 1 decision D-04 (Hero only) and D-08 (Section/ServerData come from preview/types).
 */
export function HeroRender({ section, serverData }: SectionRenderProps) {
	const hero = (section.settings.hero as HeroSettings) ?? {};
	// Section-level background override (THEME-03) — takes precedence over hero background type
	const sectionBgOverride = section.settings.backgroundColor as string | undefined;
	const {
		alignment = 'center',
		backgroundType = 'gradient',
		backgroundColor = '#ffffff',
		gradientFrom = '#f0f9ff',
		gradientTo = '#ecfdf5',
		backgroundImage = '',
		imageBlur = 0,
		imageDarken = 40,
		playerBadge = 'top',
		badgeStyle = 'pill',
		showDiscordButton = true,
		discordButtonText = 'Join Discord',
		showCopyIpButton = true,
		copyIpButtonText = 'Copy IP',
	} = hero;

	const safeImage = safeBackgroundUrl(backgroundImage);
	const hasImage = backgroundType === 'image' && !!safeImage;
	const isLight = backgroundType === 'solid' ? isLightColor(backgroundColor) : !hasImage;
	const isDark = hasImage || !isLight;
	const players = serverData.players ?? 0;

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor };
		if (backgroundType === 'gradient')
			return {
				background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
			};
		return {};
	};

	const PlayerBadge = () => {
		if (badgeStyle === 'minimal') {
			return (
				<div
					className={`inline-flex items-center gap-1.5 text-sm font-medium ${isDark ? 'text-white/90' : 'text-zinc-600'}`}
				>
					<span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
					<span className="font-bold">{players}</span> online
				</div>
			);
		}
		if (badgeStyle === 'card') {
			return (
				<div
					className={`inline-flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium ${isDark ? 'border border-white/10 bg-white/10 text-white backdrop-blur-md' : 'border border-zinc-100 bg-white text-zinc-700 shadow-lg'}`}
				>
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 animate-pulse rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
						<span className="text-lg font-bold">{players}</span>
					</div>
					<div className={`h-6 w-px ${isDark ? 'bg-white/20' : 'bg-zinc-200'}`} />
					<span className={isDark ? 'text-white/70' : 'text-zinc-500'}>
						players online
					</span>
				</div>
			);
		}
		if (badgeStyle === 'glow') {
			return (
				<div className="relative inline-flex">
					<div className="absolute inset-0 animate-pulse rounded-full bg-green-500/30 blur-xl" />
					<div
						className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isDark ? 'border border-green-500/30 bg-green-500/20 text-green-300 backdrop-blur-sm' : 'border border-green-200 bg-green-50 text-green-700'}`}
					>
						<span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
						<span className="font-bold">{players}</span>
						<span className={isDark ? 'text-green-300/70' : 'text-green-600'}>
							players online
						</span>
					</div>
				</div>
			);
		}
		// default: pill
		return (
			<div
				className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${isDark ? 'border border-white/20 bg-white/10 text-white backdrop-blur-sm' : 'border border-zinc-200 bg-white text-zinc-600 shadow-sm'}`}
			>
				<span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
				{players} players online
			</div>
		);
	};

	return (
		<div
			className="relative overflow-hidden"
			style={
				sectionBgOverride ? { backgroundColor: sectionBgOverride } : getBackgroundStyle()
			}
		>
			{hasImage && (
				<>
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url(${safeImage})`,
							filter: imageBlur > 0 ? `blur(${imageBlur}px)` : undefined,
							transform: imageBlur > 0 ? 'scale(1.1)' : undefined,
						}}
					/>
					<div
						className="absolute inset-0 bg-black"
						style={{ opacity: imageDarken / 100 }}
					/>
				</>
			)}
			{!hasImage && backgroundType === 'gradient' && (
				<>
					<div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
					<div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
				</>
			)}
			<div
				className={`relative px-6 py-20 ${
					alignment === 'center'
						? 'text-center'
						: alignment === 'right'
							? 'text-right'
							: 'text-left'
				}`}
			>
				<div className="mx-auto max-w-3xl">
					{playerBadge === 'top' && (
						<div className="mb-6">
							<PlayerBadge />
						</div>
					)}
					<h1
						className={`mb-4 text-5xl font-extrabold tracking-tight md:text-6xl ${isDark ? 'text-white' : 'text-zinc-900'}`}
						style={{ fontFamily: 'var(--site-font-display)' }}
					>
						{section.title || serverData.name}
					</h1>
					<p
						className={`mb-8 max-w-2xl text-xl ${
							alignment === 'center'
								? 'mx-auto'
								: alignment === 'right'
									? 'ml-auto'
									: ''
						} ${isDark ? 'text-white/80' : 'text-zinc-600'}`}
					>
						{section.subtitle}
					</p>
					{(showDiscordButton || showCopyIpButton) && (
						<div
							className={`flex gap-3 ${
								alignment === 'center'
									? 'justify-center'
									: alignment === 'right'
										? 'justify-end'
										: ''
							}`}
						>
							{showDiscordButton && (
								<button className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30">
									{discordButtonText}
								</button>
							)}
							{showCopyIpButton && (
								<button
									className={`rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 ${
										isDark
											? 'border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:shadow-lg hover:shadow-white/10'
											: 'border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:bg-zinc-50 hover:shadow-md'
									}`}
								>
									{copyIpButtonText}
								</button>
							)}
						</div>
					)}
					{playerBadge === 'bottom' && (
						<div className="mt-6">
							<PlayerBadge />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
