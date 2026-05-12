'use client';

import { AnimatePresence, motion, Reorder } from 'framer-motion';
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	BarChart3,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Crown,
	ExternalLink,
	Eye,
	EyeOff,
	Globe,
	Grid3X3,
	GripVertical,
	Heart,
	HelpCircle,
	Image,
	Layers,
	Layout,
	Loader2,
	Maximize2,
	MessageCircle,
	Monitor,
	Palette,
	Play,
	Plus,
	Redo2,
	Rocket,
	Rows3,
	Save,
	Scroll,
	Server,
	Shield,
	ShoppingBag,
	Smartphone,
	Sparkles,
	Star,
	Tablet,
	Trash2,
	Trophy,
	Type,
	Undo2,
	Users,
	X,
	Zap,
} from 'lucide-react';

import { useCallback, useEffect, useRef, useState, type ElementType } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ConnectionsModal } from '@/components/dashboard';
import { AppearanceTab } from '@/components/editor/appearance-tab';
import type { WebsiteData } from '@/components/preview/types';
import { SECTION_REGISTRY } from '@/lib/section-registry';
import { FONT_FAMILY_MAP, THEME_PRESETS } from '@/lib/theme-presets';
import type {
	DiscordSettings,
	FeaturesSettings,
	GallerySettings,
	GamemodesSettings,
	HeroSettings as HeroSectionSettings,
	SectionSettings,
	SectionType,
	StaffMemberSettings,
	StaffSettings,
	StatsSettings,
	TextSettings,
} from '@/types/sections';
import { DEFAULT_THEME, type SiteTheme } from '@/types/site-theme';

// Local helper types not yet separately exported from @/types/sections
type FeatureItem = { title: string; description: string; icon: string };

type GalleryImage = {
	id: string;
	url: string;
	label?: string;
};

type StatsServer = {
	id: string;
	name: string;
	address?: string;
	players?: number;
	maxPlayers?: number;
	status?: 'online' | 'offline';
};

// Common background settings used across sections (local to editor UI)
type BackgroundConfig = {
	type?: 'solid' | 'gradient' | 'image';
	color?: string;
	gradientFrom?: string;
	gradientTo?: string;
	image?: string;
	blur?: number;
	darken?: number;
};

type Section = {
	id: string;
	type: string;
	title: string | null;
	subtitle: string | null;
	visible: boolean;
	settings: SectionSettings;
};

// Reusable Background component for section previews
function SectionBackground({
	config,
	className = '',
	children,
}: {
	config: BackgroundConfig;
	className?: string;
	children: React.ReactNode;
}) {
	const {
		type = 'solid',
		color = '#ffffff',
		gradientFrom = '#ffffff',
		gradientTo = '#f4f4f5',
		image = '',
		blur = 0,
		darken = 40,
	} = config;

	const getBackgroundStyle = () => {
		if (type === 'solid') return { backgroundColor: color };
		if (type === 'gradient')
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		return {};
	};

	const hasImage = type === 'image' && image;
	const isDark = hasImage || (type === 'solid' && isColorDark(color));

	return (
		<div className={`relative overflow-hidden ${className}`} style={getBackgroundStyle()}>
			{hasImage && (
				<>
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url(${image})`,
							filter: `blur(${blur}px)`,
							transform: 'scale(1.1)',
						}}
					/>
					<div className="absolute inset-0 bg-black" style={{ opacity: darken / 100 }} />
				</>
			)}
			<div className="relative">{children}</div>
		</div>
	);
}

// Helper to determine if a hex color is dark
function isColorDark(hex: string): boolean {
	const color = hex.replace('#', '');
	const r = parseInt(color.substring(0, 2), 16);
	const g = parseInt(color.substring(2, 4), 16);
	const b = parseInt(color.substring(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return luminance < 0.5;
}

// Reusable Background Settings panel component
function BackgroundSettingsPanel({
	config,
	onChange,
	defaultGradientFrom = '#ffffff',
	defaultGradientTo = '#f4f4f5',
}: {
	config: BackgroundConfig;
	onChange: (newConfig: BackgroundConfig) => void;
	defaultGradientFrom?: string;
	defaultGradientTo?: string;
}) {
	const bgType = config.type || 'gradient';

	return (
		<div className="space-y-3 rounded-lg bg-zinc-50/50 p-3">
			<h3 className="text-xs font-semibold tracking-wider text-zinc-700 uppercase">
				Background
			</h3>

			{/* Background Type */}
			<div className="grid grid-cols-3 gap-2">
				{[
					{ value: 'solid', label: 'Solid' },
					{ value: 'gradient', label: 'Gradient' },
					{ value: 'image', label: 'Image' },
				].map(({ value, label }) => (
					<button
						key={value}
						onClick={() =>
							onChange({ ...config, type: value as BackgroundConfig['type'] })
						}
						className={`rounded-lg border p-2 text-xs transition-all ${
							bgType === value
								? 'border-cyan-300 bg-cyan-50 text-cyan-600'
								: 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
						}`}
					>
						{label}
					</button>
				))}
			</div>

			{/* Solid Color */}
			{bgType === 'solid' && (
				<div>
					<label className="mb-1.5 block text-[11px] text-zinc-500">Color</label>
					<div className="flex items-center gap-2">
						<div
							className="color-picker"
							style={{ backgroundColor: config.color || '#ffffff' }}
						>
							<input
								type="color"
								value={config.color || '#ffffff'}
								onChange={(e) => onChange({ ...config, color: e.target.value })}
								className="absolute inset-0 -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer opacity-0"
							/>
						</div>
						<input
							type="text"
							placeholder="#ffffff"
							value={config.color ?? ''}
							onChange={(e) => onChange({ ...config, color: e.target.value })}
							className="input-field min-w-0 flex-1 font-mono text-xs"
						/>
					</div>
				</div>
			)}

			{/* Gradient Colors */}
			{bgType === 'gradient' && (
				<div className="space-y-3">
					<div>
						<label className="mb-1.5 block text-[11px] text-zinc-500">From</label>
						<div className="flex items-center gap-2">
							<div
								className="color-picker"
								style={{
									backgroundColor: config.gradientFrom || defaultGradientFrom,
								}}
							>
								<input
									type="color"
									value={config.gradientFrom || defaultGradientFrom}
									onChange={(e) =>
										onChange({ ...config, gradientFrom: e.target.value })
									}
									className="absolute inset-0 -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer opacity-0"
								/>
							</div>
							<input
								type="text"
								placeholder={defaultGradientFrom}
								value={config.gradientFrom ?? ''}
								onChange={(e) =>
									onChange({ ...config, gradientFrom: e.target.value })
								}
								className="input-field min-w-0 flex-1 font-mono text-xs"
							/>
						</div>
					</div>
					<div>
						<label className="mb-1.5 block text-[11px] text-zinc-500">To</label>
						<div className="flex items-center gap-2">
							<div
								className="color-picker"
								style={{ backgroundColor: config.gradientTo || defaultGradientTo }}
							>
								<input
									type="color"
									value={config.gradientTo || defaultGradientTo}
									onChange={(e) =>
										onChange({ ...config, gradientTo: e.target.value })
									}
									className="absolute inset-0 -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer opacity-0"
								/>
							</div>
							<input
								type="text"
								placeholder={defaultGradientTo}
								value={config.gradientTo ?? ''}
								onChange={(e) =>
									onChange({ ...config, gradientTo: e.target.value })
								}
								className="input-field min-w-0 flex-1 font-mono text-xs"
							/>
						</div>
					</div>
				</div>
			)}

			{/* Image Background */}
			{bgType === 'image' && (
				<div className="space-y-3">
					<div>
						<label className="mb-1.5 block text-[11px] text-zinc-500">Image URL</label>
						<input
							type="text"
							placeholder="https://..."
							value={config.image || ''}
							onChange={(e) => onChange({ ...config, image: e.target.value })}
							className="input-field"
						/>
					</div>
					<div>
						<label className="mb-1.5 block text-[11px] text-zinc-500">
							Blur ({config.blur || 0}px)
						</label>
						<input
							type="range"
							min="0"
							max="20"
							value={config.blur || 0}
							onChange={(e) =>
								onChange({ ...config, blur: parseInt(e.target.value) })
							}
							className="w-full accent-cyan-500"
						/>
					</div>
					<div>
						<label className="mb-1.5 block text-[11px] text-zinc-500">
							Darken ({config.darken || 40}%)
						</label>
						<input
							type="range"
							min="0"
							max="100"
							value={config.darken || 40}
							onChange={(e) =>
								onChange({ ...config, darken: parseInt(e.target.value) })
							}
							className="w-full accent-cyan-500"
						/>
					</div>
				</div>
			)}
		</div>
	);
}

// Reusable Header Settings panel component
function HeaderSettingsPanel({
	title,
	subtitle,
	alignment,
	onTitleChange,
	onSubtitleChange,
	onAlignmentChange,
	titlePlaceholder = 'Enter title...',
	subtitlePlaceholder = 'Enter subtitle...',
	showAlignment = true,
}: {
	title: string;
	subtitle: string;
	alignment: 'left' | 'center' | 'right';
	onTitleChange: (value: string) => void;
	onSubtitleChange: (value: string) => void;
	onAlignmentChange: (value: 'left' | 'center' | 'right') => void;
	titlePlaceholder?: string;
	subtitlePlaceholder?: string;
	showAlignment?: boolean;
}) {
	return (
		<div className="space-y-3 rounded-lg bg-zinc-50/50 p-3">
			<h3 className="text-xs font-semibold tracking-wider text-zinc-700 uppercase">Header</h3>

			{/* Title */}
			<div>
				<label className="mb-1.5 block text-[11px] text-zinc-500">Title</label>
				<input
					type="text"
					placeholder={titlePlaceholder}
					value={title}
					onChange={(e) => onTitleChange(e.target.value)}
					className="input-field"
				/>
			</div>

			{/* Subtitle */}
			<div>
				<label className="mb-1.5 block text-[11px] text-zinc-500">Subtitle</label>
				<input
					type="text"
					placeholder={subtitlePlaceholder}
					value={subtitle}
					onChange={(e) => onSubtitleChange(e.target.value)}
					className="input-field"
				/>
			</div>

			{/* Alignment */}
			{showAlignment && (
				<div>
					<label className="mb-1.5 block text-[11px] text-zinc-500">Alignment</label>
					<div className="flex gap-2">
						{[
							{ value: 'left', icon: AlignLeft },
							{ value: 'center', icon: AlignCenter },
							{ value: 'right', icon: AlignRight },
						].map(({ value, icon: Icon }) => (
							<button
								key={value}
								onClick={() =>
									onAlignmentChange(value as 'left' | 'center' | 'right')
								}
								className={`flex-1 rounded-lg border p-2 transition-all ${
									alignment === value
										? 'border-cyan-300 bg-cyan-50 text-cyan-600'
										: 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300'
								}`}
							>
								<Icon className="mx-auto h-4 w-4" />
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// Derived from SECTION_REGISTRY — adding a new type to section-registry.tsx
// automatically makes it appear in the editor's section picker.
const sectionTypeConfig = Object.fromEntries(
	Object.entries(SECTION_REGISTRY).map(([type, entry]) => [
		type,
		{
			icon: entry.icon,
			label: entry.displayName,
			category: entry.category,
			description: entry.description,
		},
	]),
) as Record<
	string,
	{ icon: ElementType; label: string; category: string; description: string; locked?: boolean }
>;
// navbar is not in SECTION_REGISTRY (it cannot be added/removed by users)
// The locked "Navigation" card is rendered as a static hardcoded item in the section list

const sectionCategories = ['Essential', 'Community', 'Media', 'Info', 'Engagement'];

// Preview Components - Actual website sections with real styling

function PreviewStats({ section }: { section: Section }) {
	const {
		mode = 'single',
		servers = [],
		layout = 'grid',
		showTotal = true,
		showVersion = true,
		showUptime = true,
		version = '1.20.4',
		uptime = '99.9%',
		headerAlignment = 'center',
		backgroundType = 'solid',
		backgroundColor = '#18181b',
		gradientFrom = '#18181b',
		gradientTo = '#27272a',
		backgroundImage = '',
		imageBlur = 0,
		imageDarken = 40,
	} = section.settings.stats || {};

	const hasImage = backgroundType === 'image' && backgroundImage;
	const isDark =
		hasImage ||
		(backgroundType === 'solid' && backgroundColor && isColorDark(backgroundColor)) ||
		(backgroundType === 'gradient' && gradientFrom && isColorDark(gradientFrom));

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor };
		if (backgroundType === 'gradient')
			return {
				background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
			};
		return {};
	};

	// Default servers for network mode preview
	const displayServers: StatsServer[] =
		servers.length > 0
			? servers
			: [
					{ id: '1', name: 'Server 1', status: 'online' },
					{ id: '2', name: 'Server 2', status: 'online' },
					{ id: '3', name: 'Server 3', status: 'online' },
				];

	// Single server mode - show general stats
	if (mode === 'single') {
		const stats = [
			{
				value: '—',
				label: 'Players Online',
				icon: Users,
				color: 'text-green-500',
				iconBg: 'bg-green-500/10',
			},
			{
				value: '—',
				label: 'Server Capacity',
				icon: Server,
				color: isDark ? 'text-cyan-400' : 'text-cyan-600',
				iconBg: 'bg-cyan-500/10',
			},
			...(showVersion
				? [
						{
							value: '—',
							label: 'Minecraft Version',
							icon: Zap,
							color: isDark ? 'text-amber-400' : 'text-amber-600',
							iconBg: 'bg-amber-500/10',
						},
					]
				: []),
			...(showUptime
				? [
						{
							value: '—',
							label: 'Uptime',
							icon: BarChart3,
							color: isDark ? 'text-indigo-400' : 'text-indigo-600',
							iconBg: 'bg-indigo-500/10',
						},
					]
				: []),
		];

		return (
			<div
				className="@container relative overflow-hidden px-6 py-10"
				style={getBackgroundStyle()}
			>
				{hasImage && (
					<>
						<div
							className="absolute inset-0 bg-cover bg-center"
							style={{
								backgroundImage: `url(${backgroundImage})`,
								filter: `blur(${imageBlur}px)`,
								transform: 'scale(1.1)',
							}}
						/>
						<div
							className="absolute inset-0 bg-black"
							style={{ opacity: imageDarken / 100 }}
						/>
					</>
				)}
				<div className="relative mx-auto max-w-4xl">
					{section.title && (
						<div
							className={`mb-6 ${headerAlignment === 'center' ? 'text-center' : headerAlignment === 'right' ? 'text-right' : 'text-left'}`}
						>
							<h2
								className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
							>
								{section.title}
							</h2>
						</div>
					)}
					<div
						className={`${layout === 'list' ? 'space-y-3' : layout === 'compact' ? 'flex flex-wrap items-center justify-center gap-8' : 'grid grid-cols-2 gap-4 @md:grid-cols-4'}`}
					>
						{stats.map((stat, i) => (
							<div
								key={i}
								className={`${
									layout === 'list'
										? 'flex items-center justify-between rounded-xl px-5 py-4'
										: layout === 'compact'
											? 'text-center'
											: 'rounded-xl px-4 py-5 text-center'
								} ${
									layout !== 'compact'
										? isDark
											? 'border border-white/10 bg-white/5 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/20 hover:bg-white/10'
											: 'border border-zinc-200 bg-white/80 shadow-sm hover:-translate-y-1 hover:scale-[1.02] hover:border-zinc-300 hover:shadow-lg'
										: ''
								} cursor-pointer transition-all duration-200`}
							>
								{layout === 'list' ? (
									<>
										<div className="flex items-center gap-3">
											<div
												className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center`}
											>
												<stat.icon className={`h-5 w-5 ${stat.color}`} />
											</div>
											<span
												className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
											>
												{stat.label}
											</span>
										</div>
										<span className={`text-xl font-bold ${stat.color}`}>
											{stat.value}
										</span>
									</>
								) : layout === 'compact' ? (
									<>
										<div className={`text-2xl font-bold ${stat.color}`}>
											{stat.value}
										</div>
										<div
											className={`text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
										>
											{stat.label}
										</div>
									</>
								) : (
									<>
										<div
											className={`h-12 w-12 rounded-xl ${stat.iconBg} mx-auto mb-3 flex items-center justify-center`}
										>
											<stat.icon className={`h-6 w-6 ${stat.color}`} />
										</div>
										<div className={`text-2xl font-bold ${stat.color}`}>
											{stat.value}
										</div>
										<div
											className={`mt-1 text-xs font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
										>
											{stat.label}
										</div>
									</>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Network mode - show multiple servers
	return (
		<div
			className="@container relative overflow-hidden px-6 py-10"
			style={getBackgroundStyle()}
		>
			{hasImage && (
				<>
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url(${backgroundImage})`,
							filter: `blur(${imageBlur}px)`,
							transform: 'scale(1.1)',
						}}
					/>
					<div
						className="absolute inset-0 bg-black"
						style={{ opacity: imageDarken / 100 }}
					/>
				</>
			)}
			<div className="relative mx-auto max-w-4xl">
				{/* Header with total */}
				<div
					className={`mb-6 ${headerAlignment === 'center' ? 'text-center' : headerAlignment === 'right' ? 'text-right' : 'text-left'}`}
				>
					{section.title && (
						<h2
							className={`mb-2 text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
						>
							{section.title}
						</h2>
					)}
					{showTotal && (
						<div
							className={`flex items-center gap-2 ${headerAlignment === 'center' ? 'justify-center' : headerAlignment === 'right' ? 'justify-end' : 'justify-start'}`}
						>
							<span className="text-3xl font-bold text-green-500">—</span>
							<span
								className={`text-lg ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
							>
								/ — players online
							</span>
						</div>
					)}
				</div>

				{/* Server list */}
				{layout === 'list' ? (
					<div className="space-y-3">
						{displayServers.map((server) => (
							<div
								key={server.id}
								className={`flex cursor-pointer items-center justify-between rounded-xl px-5 py-4 transition-all duration-200 hover:scale-[1.01] ${
									isDark
										? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
										: 'border border-zinc-200 bg-white/80 shadow-sm hover:border-zinc-300 hover:shadow-lg'
								}`}
							>
								<div className="flex items-center gap-3">
									<div
										className={`h-3 w-3 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}
									/>
									<span
										className={`font-medium ${isDark ? 'text-white' : 'text-zinc-900'}`}
									>
										{server.name}
									</span>
								</div>
								<div className="flex items-center gap-4">
									<div className="text-right">
										<span className="font-bold text-green-500">—</span>
										<span
											className={isDark ? 'text-zinc-500' : 'text-zinc-400'}
										>
											{' '}
											/ —
										</span>
									</div>
									<div
										className={`h-2 w-24 overflow-hidden rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
									>
										<div
											className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
											style={{ width: '50%' }}
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				) : layout === 'compact' ? (
					<div className="flex flex-wrap items-center justify-center gap-6">
						{displayServers.map((server) => (
							<div key={server.id} className="text-center">
								<div className="mb-1 flex items-center gap-2">
									<div
										className={`h-2 w-2 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}
									/>
									<span
										className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
									>
										{server.name}
									</span>
								</div>
								<div>
									<span className="text-xl font-bold text-green-500">—</span>
									<span
										className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
									>
										/—
									</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @md:grid-cols-3">
						{displayServers.map((server) => (
							<div
								key={server.id}
								className={`cursor-pointer rounded-xl p-5 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] ${
									isDark
										? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
										: 'border border-zinc-200 bg-white/80 shadow-sm hover:border-zinc-300 hover:shadow-lg'
								}`}
							>
								<div className="mb-3 flex items-center gap-2">
									<div
										className={`h-3 w-3 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}
									/>
									<span
										className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}
									>
										{server.name}
									</span>
								</div>
								<div className="mb-3">
									<span className="text-2xl font-bold text-green-500">—</span>
									<span
										className={`text-lg ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
									>
										{' '}
										/ —
									</span>
								</div>
								<div
									className={`h-2 w-full overflow-hidden rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
								>
									<div
										className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
										style={{ width: '50%' }}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// Icon map for features
const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
	zap: Zap,
	shield: Shield,
	users: Users,
	star: Star,
	server: Server,
	globe: Globe,
	heart: Heart,
	trophy: Trophy,
	rocket: Rocket,
	sparkles: Sparkles,
};

const iconGradients = [
	'from-amber-500 to-orange-600',
	'from-emerald-500 to-teal-600',
	'from-indigo-500 to-purple-600',
	'from-cyan-500 to-blue-600',
	'from-rose-500 to-pink-600',
	'from-violet-500 to-purple-600',
];

function PreviewFeatures({ section }: { section: Section }) {
	const rawFeatures = section.settings.content?.features;

	// Support both old format (string[]) and new format (object[])
	const features: FeatureItem[] = Array.isArray(rawFeatures)
		? rawFeatures.map((f, i) =>
				typeof f === 'string'
					? {
							title: f,
							description: '',
							icon: ['zap', 'shield', 'users', 'star'][i] || 'zap',
						}
					: (f as FeatureItem),
			)
		: [
				{
					title: 'Fast Performance',
					description: 'Optimized servers with minimal lag',
					icon: 'zap',
				},
				{
					title: 'Anti-Cheat',
					description: 'Advanced anti-cheat protection',
					icon: 'shield',
				},
				{
					title: 'Active Community',
					description: 'Join our Discord community',
					icon: 'users',
				},
				{ title: '24/7 Uptime', description: 'Always online servers', icon: 'star' },
			];

	const {
		layout = '2x2',
		headerAlignment = 'center',
		cardAlignment = 'left',
		backgroundType = 'gradient',
		backgroundColor = '#ffffff',
		gradientFrom = '#ffffff',
		gradientTo = '#f4f4f5',
		backgroundImage = '',
		imageBlur = 0,
		imageDarken = 40,
	} = section.settings.features || {};

	const hasImage = backgroundType === 'image' && backgroundImage;
	const isDark =
		hasImage ||
		(backgroundType === 'solid' && backgroundColor && isColorDark(backgroundColor)) ||
		(backgroundType === 'gradient' && gradientFrom && isColorDark(gradientFrom));

	const featureCount = layout === '2x1' ? 2 : 4;
	const headerAlignClass =
		headerAlignment === 'center'
			? 'text-center'
			: headerAlignment === 'right'
				? 'text-right'
				: 'text-left';
	const cardAlignClass =
		cardAlignment === 'center'
			? 'text-center items-center'
			: cardAlignment === 'right'
				? 'text-right items-end'
				: 'text-left items-start';

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') {
			return { backgroundColor };
		}
		if (backgroundType === 'gradient') {
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		}
		return {};
	};

	return (
		<div className="relative overflow-hidden px-6 py-14" style={getBackgroundStyle()}>
			{/* Background Image */}
			{hasImage && (
				<>
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url(${backgroundImage})`,
							filter: `blur(${imageBlur}px)`,
							transform: 'scale(1.1)',
						}}
					/>
					<div
						className="absolute inset-0 bg-black"
						style={{ opacity: imageDarken / 100 }}
					/>
				</>
			)}

			<div className="@container relative mx-auto max-w-5xl">
				<div className={`mb-10 ${headerAlignClass}`}>
					<h2
						className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Why Join Us?'}
					</h2>
					{section.subtitle && (
						<p
							className={`max-w-2xl text-base ${headerAlignment === 'center' ? 'mx-auto' : headerAlignment === 'right' ? 'ml-auto' : ''} ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
						>
							{section.subtitle}
						</p>
					)}
				</div>

				<div
					className={`grid gap-5 ${featureCount === 2 ? '@sm:grid-cols-2' : '@sm:grid-cols-2'}`}
				>
					{features.slice(0, featureCount).map((feature, i) => {
						const Icon = featureIcons[feature.icon] || Zap;
						const gradient = iconGradients[i % iconGradients.length];
						return (
							<div
								key={i}
								className={`feature-card flex cursor-pointer flex-col rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 ${cardAlignClass} ${
									isDark
										? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
										: 'border border-zinc-200 bg-white/80 shadow-sm hover:border-zinc-300 hover:shadow-lg'
								}`}
							>
								<div
									className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} icon-wiggle mb-4 flex items-center justify-center shadow-lg`}
								>
									<Icon className="h-6 w-6 text-white" />
								</div>
								<h3
									className={`mb-2 text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
								>
									{feature.title}
								</h3>
								{feature.description && (
									<p
										className={`text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
									>
										{feature.description}
									</p>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function PreviewGamemodes({ section }: { section: Section }) {
	const modes = (section.settings.content?.modes as string[]) || [
		'Survival',
		'Skyblock',
		'Prison',
		'KitPvP',
	];

	const {
		layout = 'grid-2x2',
		cardStyle = 'default',
		headerAlignment = 'center',
		backgroundType = 'solid',
		backgroundColor = '#fafafa',
		gradientFrom = '#fafafa',
		gradientTo = '#f4f4f5',
		backgroundImage = '',
		imageBlur = 0,
		imageDarken = 40,
		showPlayerCount = true,
		showModpack = true,
		showDescription = true,
		showBadge = true,
		showViewAllButton = true,
	} = section.settings.gamemodes || {};

	const hasImage = backgroundType === 'image' && backgroundImage;
	const isDark =
		hasImage ||
		(backgroundType === 'solid' && backgroundColor && isColorDark(backgroundColor)) ||
		(backgroundType === 'gradient' && gradientFrom && isColorDark(gradientFrom));

	const alignmentClass =
		headerAlignment === 'center'
			? 'text-center'
			: headerAlignment === 'right'
				? 'text-right'
				: 'text-left';

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') {
			return { backgroundColor };
		}
		if (backgroundType === 'gradient') {
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		}
		return {};
	};

	const serverData = [
		{
			modpack: 'ATM10',
			desc: 'Endless tech, magic, and chaos.',
			players: 4,
			isPopular: true,
			bannerGradient: 'from-emerald-400 via-cyan-500 to-blue-600',
			bannerPattern: true,
		},
		{
			modpack: 'MoniFactory v1.3',
			desc: 'Factory-focused modpack with tight progression.',
			players: 0,
			isClosed: true,
			bannerGradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
			bannerPattern: false,
		},
		{
			modpack: 'Custom Pack',
			desc: 'Our own curated modpack experience.',
			players: 12,
			bannerGradient: 'from-amber-400 via-orange-500 to-red-500',
			bannerPattern: true,
		},
		{
			modpack: 'Vanilla+',
			desc: 'Enhanced vanilla with quality of life mods.',
			players: 8,
			bannerGradient: 'from-rose-400 via-pink-500 to-purple-500',
			bannerPattern: false,
		},
	];

	const gridClass =
		layout === 'single'
			? 'max-w-2xl mx-auto'
			: layout === 'grid-4'
				? 'flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none @sm:grid @sm:grid-cols-2 @sm:overflow-visible @lg:grid-cols-4'
				: layout === 'list'
					? 'flex flex-col gap-3'
					: 'grid @sm:grid-cols-2 gap-5';

	// For single layout, only show first server
	const displayModes = layout === 'single' ? modes.slice(0, 1) : modes.slice(0, 4);

	return (
		<div className="relative overflow-hidden px-6 py-14" style={getBackgroundStyle()}>
			{/* Background Image */}
			{hasImage && (
				<>
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url(${backgroundImage})`,
							filter: `blur(${imageBlur}px)`,
							transform: 'scale(1.1)',
						}}
					/>
					<div
						className="absolute inset-0 bg-black"
						style={{ opacity: imageDarken / 100 }}
					/>
				</>
			)}

			<div className="@container relative mx-auto max-w-5xl">
				<div className={`mb-8 ${alignmentClass}`}>
					<h2
						className={`mb-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Active Servers'}
					</h2>
					{section.subtitle && (
						<p className={`${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
							{section.subtitle}
						</p>
					)}
				</div>

				<div className={gridClass}>
					{displayModes.map((mode, i) => {
						const data = serverData[i] || serverData[0];

						// Single layout - large featured card
						if (layout === 'single') {
							return (
								<div
									key={i}
									className={`group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] ${
										isDark
											? 'border border-white/10 bg-white/5 hover:border-white/20'
											: 'border border-zinc-200 bg-white/80 shadow-md hover:border-zinc-300 hover:shadow-xl'
									}`}
								>
									{/* Large banner */}
									<div
										className={`relative aspect-[2.5/1] bg-gradient-to-br ${data.bannerGradient}`}
									>
										{data.bannerPattern && (
											<div
												className="absolute inset-0 opacity-20"
												style={{
													backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`,
													backgroundSize: '12px 12px',
												}}
											/>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

										{showBadge && data.isPopular && (
											<span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
												<Star className="h-4 w-4 fill-current" /> Popular
											</span>
										)}
										{showBadge && data.isClosed && (
											<span className="absolute top-4 right-4 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
												Closed
											</span>
										)}

										{/* Player count overlay on banner */}
										{showPlayerCount && !data.isClosed && (
											<div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
												<span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
												<span className="font-medium text-white">
													{data.players} online
												</span>
											</div>
										)}
									</div>

									{/* Content */}
									<div className="p-6">
										<div className="mb-3 flex items-start justify-between gap-4">
											<div>
												<h3
													className={`text-2xl font-bold transition-colors group-hover:text-indigo-600 ${isDark ? 'text-white' : 'text-zinc-900'}`}
												>
													{mode}
												</h3>
												{showModpack && (
													<p
														className={`text-base ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
													>
														{data.modpack}
													</p>
												)}
											</div>
										</div>

										{showDescription && (
											<p
												className={`mb-5 text-base ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
											>
												{data.desc}
											</p>
										)}

										<button
											className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
												isDark
													? 'bg-indigo-600 text-white hover:bg-indigo-500'
													: 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-cyan-200/50'
											}`}
										>
											Join Server
											<ChevronRight className="h-4 w-4" />
										</button>
									</div>
								</div>
							);
						}

						// List layout - horizontal card
						if (layout === 'list') {
							return (
								<div
									key={i}
									className={`group flex cursor-pointer items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:scale-[1.01] ${
										isDark
											? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
											: 'border border-zinc-200 bg-white/80 shadow-sm hover:border-zinc-300 hover:shadow-lg'
									}`}
								>
									{/* Mini banner */}
									<div
										className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${data.bannerGradient}`}
									>
										{data.bannerPattern && (
											<div
												className="absolute inset-0 opacity-20"
												style={{
													backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`,
													backgroundSize: '8px 8px',
												}}
											/>
										)}
										{showBadge && data.isPopular && (
											<span className="absolute top-1 right-1 rounded bg-indigo-600 p-0.5">
												<Star className="h-2.5 w-2.5 fill-current text-white" />
											</span>
										)}
										{showPlayerCount && (
											<div className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] backdrop-blur-sm">
												<span
													className={`h-1.5 w-1.5 rounded-full ${data.isClosed ? 'bg-red-500' : 'animate-pulse bg-green-500'}`}
												/>
												<span className="font-medium text-white">
													{data.isClosed ? 'Off' : data.players}
												</span>
											</div>
										)}
									</div>

									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<h3
												className={`truncate font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
											>
												{mode}
											</h3>
											{showBadge && data.isClosed && (
												<span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
													Closed
												</span>
											)}
										</div>
										{showModpack && (
											<p
												className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
											>
												{data.modpack}
											</p>
										)}
									</div>

									<button
										className={`flex flex-shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
											isDark
												? 'bg-indigo-600 text-white hover:bg-indigo-500'
												: 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-md'
										}`}
									>
										Join
										<ChevronRight className="h-3 w-3" />
									</button>
								</div>
							);
						}

						// Compact style - smaller cards
						if (cardStyle === 'compact') {
							return (
								<div
									key={i}
									className={`group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-200 ${
										isDark
											? 'border border-white/10 bg-white/5 hover:border-white/20'
											: 'border border-zinc-200 bg-white/80 shadow-sm hover:border-zinc-300 hover:shadow-md'
									}`}
								>
									<div
										className={`relative aspect-[3/1] bg-gradient-to-br ${data.bannerGradient}`}
									>
										<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
										{showBadge && (data.isPopular || data.isClosed) && (
											<span
												className={`absolute top-2 right-2 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-white shadow ${data.isClosed ? 'bg-red-600' : 'bg-indigo-600'}`}
											>
												{data.isClosed ? 'Closed' : 'Popular'}
											</span>
										)}
										{showPlayerCount && (
											<div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/40 px-1.5 py-0.5 backdrop-blur-sm">
												<span
													className={`h-1.5 w-1.5 rounded-full ${data.isClosed ? 'bg-red-500' : 'animate-pulse bg-green-500'}`}
												/>
												<span className="text-[10px] font-medium text-white">
													{data.isClosed ? 'Closed' : `${data.players}`}
												</span>
											</div>
										)}
									</div>
									<div className="p-3">
										<h3
											className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
										>
											{mode}
										</h3>
										{showModpack && (
											<p
												className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
											>
												{data.modpack}
											</p>
										)}
										<button
											className={`mt-2 flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
												isDark
													? 'bg-indigo-600 text-white hover:bg-indigo-500'
													: 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
											}`}
										>
											Join
											<ChevronRight className="h-3 w-3" />
										</button>
									</div>
								</div>
							);
						}

						// Minimal style - text focused
						if (cardStyle === 'minimal') {
							return (
								<div
									key={i}
									className={`group cursor-pointer rounded-xl border-l-4 p-4 transition-all ${
										isDark
											? 'border-l-cyan-500 bg-white/5 hover:bg-white/10'
											: 'border-l-cyan-500 bg-white/80 hover:shadow-md'
									}`}
								>
									<div className="flex items-start justify-between">
										<div>
											<h3
												className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
											>
												{mode}
											</h3>
											{showModpack && (
												<p
													className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
												>
													{data.modpack}
												</p>
											)}
											{showDescription && (
												<p
													className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
												>
													{data.desc}
												</p>
											)}
										</div>
										{showBadge && (data.isPopular || data.isClosed) && (
											<span
												className={`rounded px-2 py-1 text-xs font-medium ${
													data.isClosed
														? 'bg-red-100 text-red-600'
														: 'bg-indigo-100 text-indigo-600'
												}`}
											>
												{data.isClosed ? 'Closed' : 'Popular'}
											</span>
										)}
									</div>
									{showPlayerCount && !data.isClosed && (
										<span className="mt-3 flex items-center gap-1.5 text-sm font-medium text-green-600">
											<span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
											{data.players} online
										</span>
									)}
								</div>
							);
						}

						// Default style - full cards with banner
						return (
							<div
								key={i}
								className={`group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] ${
									layout === 'grid-4'
										? 'min-w-[260px] flex-shrink-0 snap-start @sm:min-w-0 @sm:flex-shrink'
										: ''
								} ${
									isDark
										? 'border border-white/10 bg-white/5 hover:border-white/20'
										: 'border border-zinc-200 bg-white/80 shadow-sm hover:border-zinc-300 hover:shadow-xl'
								}`}
							>
								<div
									className={`relative ${layout === 'grid-4' ? 'aspect-[2.5/1]' : 'aspect-[2/1]'} bg-gradient-to-br ${data.bannerGradient}`}
								>
									{data.bannerPattern && (
										<div
											className="absolute inset-0 opacity-20"
											style={{
												backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 0h10v10H0V0zm10 10h10v10H10V10z'/%3E%3C/g%3E%3C/svg%3E")`,
												backgroundSize: '10px 10px',
											}}
										/>
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

									{showBadge && data.isPopular && (
										<span
											className={`absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-indigo-600 font-bold text-white shadow-lg ${layout === 'grid-4' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
										>
											<Star
												className={`${layout === 'grid-4' ? 'h-2.5 w-2.5' : 'h-3 w-3'} fill-current`}
											/>{' '}
											Popular
										</span>
									)}
									{showBadge && data.isClosed && (
										<span
											className={`absolute top-2 right-2 rounded-lg bg-red-600 font-bold text-white shadow-lg ${layout === 'grid-4' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
										>
											Closed
										</span>
									)}

									{/* Player count overlay on banner */}
									{showPlayerCount && !data.isClosed && (
										<div
											className={`absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/40 backdrop-blur-sm ${layout === 'grid-4' ? 'px-2 py-1' : 'px-2.5 py-1.5'}`}
										>
											<span
												className={`animate-pulse rounded-full bg-green-500 ${layout === 'grid-4' ? 'h-1.5 w-1.5' : 'h-2 w-2'}`}
											/>
											<span
												className={`font-medium text-white ${layout === 'grid-4' ? 'text-[10px]' : 'text-xs'}`}
											>
												{data.players} online
											</span>
										</div>
									)}
									{showPlayerCount && data.isClosed && (
										<div
											className={`absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/40 backdrop-blur-sm ${layout === 'grid-4' ? 'px-2 py-1' : 'px-2.5 py-1.5'}`}
										>
											<span
												className={`rounded-full bg-red-500 ${layout === 'grid-4' ? 'h-1.5 w-1.5' : 'h-2 w-2'}`}
											/>
											<span
												className={`font-medium text-white/80 ${layout === 'grid-4' ? 'text-[10px]' : 'text-xs'}`}
											>
												Closed
											</span>
										</div>
									)}
								</div>

								<div className={layout === 'grid-4' ? 'p-3' : 'p-4'}>
									<div className="mb-2">
										<h3
											className={`${layout === 'grid-4' ? 'text-sm' : 'text-lg'} font-bold transition-colors group-hover:text-indigo-600 ${isDark ? 'text-white' : 'text-zinc-900'}`}
										>
											{mode}
										</h3>
										{showModpack && (
											<p
												className={`${layout === 'grid-4' ? 'text-xs' : 'text-sm'} ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
											>
												{data.modpack}
											</p>
										)}
									</div>

									{showDescription && layout !== 'grid-4' && (
										<p
											className={`mb-4 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
										>
											{data.desc}
										</p>
									)}

									<button
										className={`flex w-full items-center justify-center gap-1.5 rounded-lg font-medium transition-all ${
											layout === 'grid-4'
												? 'px-2 py-1.5 text-xs'
												: 'px-4 py-2.5 text-sm'
										} ${
											isDark
												? 'bg-indigo-600 text-white hover:bg-indigo-500'
												: 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-cyan-200/50'
										}`}
									>
										Join Server
										<ChevronRight
											className={layout === 'grid-4' ? 'h-3 w-3' : 'h-4 w-4'}
										/>
									</button>
								</div>
							</div>
						);
					})}
				</div>

				{showViewAllButton && layout !== 'single' && (
					<div className="mt-8 text-center">
						<button
							className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
								isDark
									? 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
									: 'border border-zinc-200 bg-white/80 text-zinc-700 shadow-sm hover:bg-white'
							}`}
						>
							View all servers
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

function PreviewDiscord({ section }: { section: Section }) {
	const {
		layout = 'default',
		alignment = 'left',
		backgroundType = 'gradient',
		backgroundColor = '#eef2ff',
		gradientFrom = '#eef2ff',
		gradientTo = '#faf5ff',
		backgroundImage = '',
		imageBlur = 0,
		imageDarken = 40,
		showBadge = true,
		showStats = true,
		memberCount,
		onlineCount,
		buttonText = 'Join Server',
		guildName,
		guildIcon,
		guildBanner,
		inviteCode,
	} = section.settings.discord || {};

	const formatCount = (count?: number) => {
		if (!count) return '—';
		if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
		return count.toString();
	};

	const hasImage = backgroundType === 'image' && backgroundImage;
	const isDark =
		hasImage || (backgroundType === 'solid' && backgroundColor && isColorDark(backgroundColor));

	const alignmentClass =
		alignment === 'center'
			? 'text-center items-center'
			: alignment === 'right'
				? 'text-right items-end'
				: 'text-left items-start';
	const statsJustify =
		alignment === 'center'
			? 'justify-center'
			: alignment === 'right'
				? 'justify-end'
				: 'justify-start';

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor };
		if (backgroundType === 'gradient')
			return {
				background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
			};
		return {};
	};

	// Discord Card component
	const DiscordCard = ({ compact = false }: { compact?: boolean }) => (
		<div
			className={`flex-shrink-0 overflow-hidden rounded-2xl bg-[#2b2d31] shadow-2xl ${compact ? 'w-full max-w-sm' : 'w-full @md:w-80'}`}
		>
			<div className="relative h-24 bg-gradient-to-br from-indigo-500 to-purple-600">
				{guildBanner && (
					<img
						src={guildBanner}
						alt=""
						className="absolute inset-0 h-full w-full object-cover"
					/>
				)}
				<div className="absolute -bottom-6 left-4">
					{guildIcon ? (
						<img
							src={guildIcon}
							alt={guildName || 'Discord server'}
							className="h-14 w-14 rounded-2xl border-4 border-[#2b2d31] object-cover"
						/>
					) : (
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-[#2b2d31] bg-gradient-to-br from-emerald-400 to-cyan-500">
							<span className="text-lg font-bold text-white">
								{(guildName || 'Server').charAt(0)}
							</span>
						</div>
					)}
				</div>
			</div>
			<div className="px-4 pt-8 pb-4">
				<h3 className="text-lg font-bold text-white">{guildName || 'Server'}</h3>
				<div className="mt-3 flex items-center gap-4 text-sm">
					<span className="flex items-center gap-1.5 text-zinc-400">
						<span className="h-2 w-2 rounded-full bg-green-500" />
						{formatCount(onlineCount)} Online
					</span>
					<span className="flex items-center gap-1.5 text-zinc-400">
						<span className="h-2 w-2 rounded-full bg-zinc-500" />
						{formatCount(memberCount)} Members
					</span>
				</div>
				<button className="mt-4 w-full rounded-lg bg-[#5865f2] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4752c4]">
					{buttonText}
				</button>
			</div>
		</div>
	);

	// Compact layout - no card, just CTA
	if (layout === 'compact') {
		return (
			<div
				className="@container relative overflow-hidden px-6 py-10"
				style={getBackgroundStyle()}
			>
				{hasImage && (
					<>
						<div
							className="absolute inset-0 bg-cover bg-center"
							style={{
								backgroundImage: `url(${backgroundImage})`,
								filter: `blur(${imageBlur}px)`,
								transform: 'scale(1.1)',
							}}
						/>
						<div
							className="absolute inset-0 bg-black"
							style={{ opacity: imageDarken / 100 }}
						/>
					</>
				)}
				<div className="relative mx-auto max-w-4xl">
					<div className="flex flex-col items-center justify-between gap-6 @md:flex-row">
						<div className="flex items-center gap-4">
							{guildIcon ? (
								<img src={guildIcon} alt="" className="h-12 w-12 rounded-xl" />
							) : (
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
									<MessageCircle className="h-6 w-6 text-white" />
								</div>
							)}
							<div>
								<h2
									className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
								>
									{section.title || 'Join Our Discord'}
								</h2>
								{showStats && (memberCount || onlineCount) && (
									<p
										className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
									>
										{formatCount(memberCount)} members ·{' '}
										{formatCount(onlineCount)} online
									</p>
								)}
							</div>
						</div>
						<button className="flex items-center gap-2 rounded-xl bg-[#5865f2] px-6 py-3 font-medium text-white transition-colors hover:bg-[#4752c4]">
							<MessageCircle className="h-5 w-5" />
							{buttonText}
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Centered layout - card below text
	if (layout === 'centered') {
		return (
			<div
				className="@container relative overflow-hidden px-6 py-14"
				style={getBackgroundStyle()}
			>
				{hasImage && (
					<>
						<div
							className="absolute inset-0 bg-cover bg-center"
							style={{
								backgroundImage: `url(${backgroundImage})`,
								filter: `blur(${imageBlur}px)`,
								transform: 'scale(1.1)',
							}}
						/>
						<div
							className="absolute inset-0 bg-black"
							style={{ opacity: imageDarken / 100 }}
						/>
					</>
				)}
				<div className="relative mx-auto max-w-5xl text-center">
					<div className="mb-8 flex flex-col items-center">
						{showBadge && (
							<div
								className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}
							>
								<MessageCircle className="h-3.5 w-3.5" />
								Community
							</div>
						)}
						<h2
							className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
						>
							{section.title || 'Join Our Discord'}
						</h2>
						{section.subtitle && (
							<p
								className={`mb-6 max-w-lg text-base ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
							>
								{section.subtitle}
							</p>
						)}
						{showStats && (memberCount || onlineCount) && (
							<div className="flex items-center justify-center gap-6">
								<div className="text-center">
									<div
										className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
									>
										{formatCount(memberCount)}
									</div>
									<div
										className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
									>
										Members
									</div>
								</div>
								<div
									className={`h-10 w-px ${isDark ? 'bg-zinc-600' : 'bg-zinc-200'}`}
								/>
								<div className="text-center">
									<div className="text-2xl font-bold text-green-500">
										{formatCount(onlineCount)}
									</div>
									<div
										className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
									>
										Online
									</div>
								</div>
							</div>
						)}
					</div>
					<div className="flex justify-center">
						<DiscordCard />
					</div>
				</div>
			</div>
		);
	}

	// Default and card-left layouts
	// On mobile: always centered (text first, card below)
	// On desktop: side by side with card on left or right
	const isCardLeft = layout === 'card-left';

	// Desktop alignment classes based on alignment setting
	const desktopAlignClass =
		alignment === 'center'
			? '@md:items-center @md:text-center'
			: alignment === 'right'
				? '@md:items-end @md:text-right'
				: '@md:items-start @md:text-left';

	const desktopStatsJustify =
		alignment === 'center'
			? '@md:justify-center'
			: alignment === 'right'
				? '@md:justify-end'
				: '@md:justify-start';

	return (
		<div
			className="@container relative overflow-hidden px-6 py-14"
			style={getBackgroundStyle()}
		>
			{hasImage && (
				<>
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url(${backgroundImage})`,
							filter: `blur(${imageBlur}px)`,
							transform: 'scale(1.1)',
						}}
					/>
					<div
						className="absolute inset-0 bg-black"
						style={{ opacity: imageDarken / 100 }}
					/>
				</>
			)}
			<div className="relative mx-auto max-w-5xl">
				<div className="flex flex-col items-center gap-8 @md:flex-row">
					{/* Text content - always first on mobile, order changes on desktop */}
					<div
						className={`flex flex-1 flex-col items-center text-center ${desktopAlignClass} ${isCardLeft ? '@md:order-2' : '@md:order-1'}`}
					>
						{showBadge && (
							<div
								className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}
							>
								<MessageCircle className="h-3.5 w-3.5" />
								Community
							</div>
						)}
						<h2
							className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
						>
							{section.title || 'Join Our Discord'}
						</h2>
						{section.subtitle && (
							<p
								className={`mb-6 max-w-lg text-base ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
							>
								{section.subtitle}
							</p>
						)}
						{showStats && (memberCount || onlineCount) && (
							<div
								className={`flex items-center justify-center gap-6 ${desktopStatsJustify}`}
							>
								<div
									className={`text-center ${alignment === 'left' ? '@md:text-left' : alignment === 'right' ? '@md:text-right' : ''}`}
								>
									<div
										className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
									>
										{formatCount(memberCount)}
									</div>
									<div
										className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
									>
										Members
									</div>
								</div>
								<div
									className={`h-10 w-px ${isDark ? 'bg-zinc-600' : 'bg-zinc-200'}`}
								/>
								<div
									className={`text-center ${alignment === 'left' ? '@md:text-left' : alignment === 'right' ? '@md:text-right' : ''}`}
								>
									<div className="text-2xl font-bold text-green-500">
										{formatCount(onlineCount)}
									</div>
									<div
										className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
									>
										Online
									</div>
								</div>
							</div>
						)}
						{showStats && !memberCount && !onlineCount && (
							<p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
								Enter a Discord invite to show stats
							</p>
						)}
					</div>

					{/* Discord card - always second on mobile, order changes on desktop */}
					<div className={isCardLeft ? '@md:order-1' : '@md:order-2'}>
						<DiscordCard />
					</div>
				</div>
			</div>
		</div>
	);
}

function PreviewGallery({ section }: { section: Section }) {
	const {
		layout = 'bento',
		columns = 3,
		images = [],
		showLabels = true,
		headerAlignment = 'center',
		backgroundType = 'solid',
		backgroundColor = '#ffffff',
		gradientFrom = '#ffffff',
		gradientTo = '#f4f4f5',
		backgroundImage = '',
		imageBlur = 0,
		imageDarken = 40,
	} = section.settings.gallery || {};

	const hasBackgroundImage = backgroundType === 'image' && backgroundImage;
	const isDark =
		hasBackgroundImage ||
		(backgroundType === 'solid' && backgroundColor && isColorDark(backgroundColor)) ||
		(backgroundType === 'gradient' && gradientFrom && isColorDark(gradientFrom));

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor };
		if (backgroundType === 'gradient')
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		return {};
	};

	// Placeholder images when none are added
	const placeholderImages: GalleryImage[] = [
		{ id: '1', url: '', label: 'Spawn Area' },
		{ id: '2', url: '', label: 'PvP Arena' },
		{ id: '3', url: '', label: 'Shop District' },
		{ id: '4', url: '', label: 'Event Hall' },
	];

	const placeholderGradients = [
		'from-emerald-400 via-cyan-500 to-blue-600',
		'from-violet-400 via-purple-500 to-fuchsia-600',
		'from-amber-400 via-orange-500 to-red-500',
		'from-rose-400 via-pink-500 to-purple-500',
	];

	const displayImages = images.length > 0 ? images : placeholderImages;

	// Render a single image card
	const renderImageCard = (img: GalleryImage, index: number, extraClasses = '') => {
		const isPlaceholder = !img.url;
		const gradient = placeholderGradients[index % placeholderGradients.length];

		return (
			<div
				key={img.id}
				className={`group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${extraClasses}`}
			>
				{/* Image or placeholder gradient */}
				{isPlaceholder ? (
					<div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
						<div
							className="absolute inset-0 opacity-30"
							style={{
								backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.2'%3E%3Cpath d='M5 0h1L0 5V4L4 0H5zm1 5v1H5L6 5zm-6 0l.5-.5L1 5H0zm0-5h.5L0 .5V0z'/%3E%3C/g%3E%3C/svg%3E")`,
							}}
						/>
					</div>
				) : (
					<img
						src={img.url}
						alt={img.label || ''}
						className="absolute inset-0 h-full w-full object-cover"
					/>
				)}

				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

				{/* Label */}
				{showLabels && img.label && (
					<div className="absolute inset-0 flex flex-col justify-end p-4">
						<div className="translate-y-2 transform transition-transform group-hover:translate-y-0">
							<h3 className="text-lg font-bold text-white drop-shadow-lg">
								{img.label}
							</h3>
							<p className="text-sm text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
								Click to view
							</p>
						</div>
					</div>
				)}

				{/* Expand icon */}
				<div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
					<Maximize2 className="h-4 w-4 text-white" />
				</div>
			</div>
		);
	};

	return (
		<div
			className="@container relative overflow-hidden px-6 py-14"
			style={getBackgroundStyle()}
		>
			{hasBackgroundImage && (
				<>
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url(${backgroundImage})`,
							filter: `blur(${imageBlur}px)`,
							transform: 'scale(1.1)',
						}}
					/>
					<div
						className="absolute inset-0 bg-black"
						style={{ opacity: imageDarken / 100 }}
					/>
				</>
			)}

			<div className="relative mx-auto max-w-5xl">
				<div
					className={`mb-10 ${headerAlignment === 'center' ? 'text-center' : headerAlignment === 'right' ? 'text-right' : 'text-left'}`}
				>
					<h2
						className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Screenshots'}
					</h2>
					{section.subtitle && (
						<p className={`${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
							{section.subtitle}
						</p>
					)}
				</div>

				{/* Bento layout - mixed sizes */}
				{layout === 'bento' && (
					<div className="grid grid-cols-3 gap-3">
						{displayImages
							.slice(0, 4)
							.map((img, i) =>
								renderImageCard(
									img,
									i,
									i === 0 || i === 3
										? 'col-span-2 aspect-[2/1]'
										: 'aspect-square',
								),
							)}
					</div>
				)}

				{/* Grid layout - uniform sizes */}
				{layout === 'grid' && (
					<div
						className={`grid gap-3 ${
							columns === 2
								? 'grid-cols-2'
								: columns === 4
									? 'grid-cols-2 @md:grid-cols-4'
									: 'grid-cols-2 @md:grid-cols-3'
						}`}
					>
						{displayImages.map((img, i) => renderImageCard(img, i, 'aspect-video'))}
					</div>
				)}

				{/* Masonry layout - alternating heights */}
				{layout === 'masonry' && (
					<div className={`columns-2 @md:columns-${columns} gap-3 space-y-3`}>
						{displayImages.map((img, i) => (
							<div key={img.id} className="break-inside-avoid">
								{renderImageCard(
									img,
									i,
									i % 3 === 0
										? 'aspect-[3/4]'
										: i % 3 === 1
											? 'aspect-square'
											: 'aspect-video',
								)}
							</div>
						))}
					</div>
				)}

				{displayImages.length === 0 && (
					<div
						className={`rounded-2xl border-2 border-dashed py-12 text-center ${
							isDark
								? 'border-white/20 text-zinc-400'
								: 'border-zinc-300 text-zinc-500'
						}`}
					>
						<Image className="mx-auto mb-3 h-12 w-12 opacity-50" />
						<p>No screenshots added yet</p>
						<p className="text-sm opacity-75">Add images in the settings panel</p>
					</div>
				)}
			</div>
		</div>
	);
}

function PreviewStaff({ section }: { section: Section }) {
	const staffSettings = section.settings.staff || {};
	const {
		layout = 'grid',
		backgroundType = 'solid',
		backgroundColor = '#fafafa',
		gradientFrom = '#fafafa',
		gradientTo = '#f4f4f5',
		showOnlineStatus = true,
		headerAlignment = 'center',
		members = [],
	} = staffSettings;

	const isDark =
		(backgroundType === 'solid' && isColorDark(backgroundColor)) ||
		(backgroundType === 'gradient' && isColorDark(gradientFrom));

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor };
		if (backgroundType === 'gradient')
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		return {};
	};

	// Role color mapping
	const roleColors: Record<string, string> = {
		red: 'text-red-500',
		orange: 'text-orange-500',
		amber: 'text-amber-500',
		yellow: 'text-yellow-500',
		lime: 'text-lime-500',
		green: 'text-green-500',
		emerald: 'text-emerald-500',
		teal: 'text-teal-500',
		cyan: 'text-cyan-500',
		sky: 'text-sky-500',
		blue: 'text-blue-500',
		indigo: 'text-indigo-500',
		violet: 'text-violet-500',
		purple: 'text-purple-500',
		fuchsia: 'text-fuchsia-500',
		pink: 'text-pink-500',
		rose: 'text-rose-500',
	};

	// Default staff for preview when no members configured
	const defaultStaff: StaffMemberSettings[] = [
		{ username: 'Notch', role: 'Owner', roleColor: 'red' },
		{ username: 'jeb_', role: 'Admin', roleColor: 'indigo' },
		{ username: 'Dinnerbone', role: 'Moderator', roleColor: 'emerald' },
		{ username: 'MHF_Steve', role: 'Helper', roleColor: 'cyan' },
	];

	const displayStaff = members.length > 0 ? members : defaultStaff;

	const gridClass =
		layout === 'list'
			? 'flex flex-col gap-3 max-w-2xl mx-auto'
			: layout === 'compact'
				? 'flex flex-wrap justify-center gap-6'
				: 'grid grid-cols-2 sm:grid-cols-4 gap-5';

	const alignmentClass =
		headerAlignment === 'left'
			? 'text-left'
			: headerAlignment === 'right'
				? 'text-right'
				: 'text-center';

	return (
		<div className="relative overflow-hidden px-6 py-14" style={getBackgroundStyle()}>
			<div className="relative mx-auto max-w-5xl">
				<div className={`${alignmentClass} mb-10`}>
					<h2
						className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Meet Our Team'}
					</h2>
					{section.subtitle && (
						<p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
							{section.subtitle}
						</p>
					)}
				</div>

				<div className={gridClass}>
					{displayStaff.map((member) => {
						const colorClass = roleColors[member.roleColor] || 'text-indigo-500';

						// List layout
						if (layout === 'list') {
							return (
								<div
									key={member.username}
									className={`group flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] ${
										isDark
											? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
											: 'border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow-lg'
									}`}
								>
									<div className="relative">
										<img
											src={`https://minotar.net/bust/${member.username}/64`}
											alt={member.username}
											className="h-14 w-14 rounded-xl shadow-md transition-transform group-hover:scale-105"
										/>
										{!!showOnlineStatus && (
											<div
												className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 bg-green-500 ${isDark ? 'border-zinc-900' : 'border-white'}`}
											/>
										)}
									</div>
									<div className="flex-1">
										<p
											className={`font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
										>
											{member.username}
										</p>
										<p className={`text-sm font-semibold ${colorClass}`}>
											{member.role}
										</p>
									</div>
								</div>
							);
						}

						// Compact layout
						if (layout === 'compact') {
							return (
								<div key={member.username} className="group text-center">
									<div className="relative mx-auto mb-2">
										<img
											src={`https://minotar.net/bust/${member.username}/56`}
											alt={member.username}
											className="h-14 w-14 cursor-pointer rounded-xl shadow-md transition-transform group-hover:scale-110"
										/>
										{!!showOnlineStatus && (
											<div
												className={`absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 bg-green-500 ${isDark ? 'border-zinc-900' : 'border-zinc-50'}`}
											/>
										)}
									</div>
									<p
										className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}
									>
										{member.username}
									</p>
									<p className={`text-xs font-medium ${colorClass}`}>
										{member.role}
									</p>
								</div>
							);
						}

						// Default grid layout
						return (
							<div
								key={member.username}
								className={`group cursor-pointer rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] ${
									isDark
										? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
										: 'border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow-xl'
								}`}
							>
								<div className="relative mx-auto mb-4 w-fit">
									<img
										src={`https://minotar.net/bust/${member.username}/80`}
										alt={member.username}
										className="h-20 w-20 rounded-2xl shadow-lg transition-transform group-hover:scale-105"
									/>
									{!!showOnlineStatus && (
										<div
											className={`absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 bg-green-500 ${isDark ? 'border-zinc-900' : 'border-white'}`}
										/>
									)}
								</div>
								<p
									className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
								>
									{member.username}
								</p>
								<p className={`mt-1 text-sm font-semibold ${colorClass}`}>
									{member.role}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function PreviewText({ section }: { section: Section }) {
	const {
		content = '',
		alignment = 'left',
		size = 'medium',
		backgroundType = 'solid',
		backgroundColor = '#ffffff',
		gradientFrom = '#ffffff',
		gradientTo = '#f4f4f5',
		backgroundImage = '',
		imageBlur = 0,
		imageDarken = 40,
	} = section.settings.text || {};

	const hasImage = backgroundType === 'image' && backgroundImage;
	const isDark =
		hasImage ||
		(backgroundType === 'solid' && isColorDark(backgroundColor)) ||
		(backgroundType === 'gradient' && isColorDark(gradientFrom));

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor };
		if (backgroundType === 'gradient')
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		return {};
	};

	const alignmentClass =
		alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';
	const sizeClass = size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base';

	const displayContent =
		content ||
		section.subtitle ||
		'Add your custom text content here. You can use this section for announcements, descriptions, or any other information you want to share with your visitors.';

	return (
		<div className="relative overflow-hidden px-6 py-12" style={getBackgroundStyle()}>
			{hasImage && (
				<>
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url(${backgroundImage})`,
							filter: `blur(${imageBlur}px)`,
							transform: 'scale(1.1)',
						}}
					/>
					<div
						className="absolute inset-0 bg-black"
						style={{ opacity: imageDarken / 100 }}
					/>
				</>
			)}
			<div className="relative mx-auto max-w-3xl">
				{section.title && (
					<h2
						className={`mb-4 text-2xl font-bold ${alignmentClass} ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title}
					</h2>
				)}
				<div
					className={`${alignmentClass} ${sizeClass} ${isDark ? 'text-zinc-300' : 'text-zinc-600'} leading-relaxed whitespace-pre-wrap`}
				>
					{displayContent}
				</div>
			</div>
		</div>
	);
}

function PreviewRules({ section }: { section: Section }) {
	const { colorScheme = 'default' } = section.settings;
	const isDark = colorScheme === 'dark';

	const rules = [
		{
			title: 'No Griefing',
			desc: "Respect other players' builds and property. Destroying or modifying builds without permission will result in a ban.",
			icon: Shield,
		},
		{
			title: 'Be Respectful',
			desc: 'Treat all players with kindness. Harassment, hate speech, or toxic behavior is not tolerated.',
			icon: Users,
		},
		{
			title: 'No Cheating',
			desc: 'Hacked clients, x-ray, or any unfair advantage mods are strictly prohibited.',
			icon: Zap,
		},
		{
			title: 'No Spam',
			desc: 'Keep chat clean. Excessive caps, repeated messages, or advertising is not allowed.',
			icon: MessageCircle,
		},
	];

	return (
		<div className={`px-6 py-14 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
			<div className="mx-auto max-w-4xl">
				<div className="mb-10 text-center">
					<div
						className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
							isDark ? 'bg-red-500/10' : 'bg-red-50'
						}`}
					>
						<Scroll className="h-7 w-7 text-red-500" />
					</div>
					<h2
						className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Server Rules'}
					</h2>
					<p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
						Please follow these rules to keep our community safe and fun
					</p>
				</div>

				<div className="space-y-4">
					{rules.map((rule, i) => {
						const Icon = rule.icon;
						return (
							<div
								key={i}
								className={`flex items-start gap-4 rounded-2xl p-5 transition-all hover:scale-[1.01] ${
									isDark
										? 'border border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
										: 'border border-zinc-100 bg-zinc-50 hover:border-zinc-200 hover:shadow-sm'
								}`}
							>
								<div
									className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 font-bold text-white shadow-lg`}
								>
									{i + 1}
								</div>
								<div className="min-w-0 flex-1">
									<div className="mb-1 flex items-center gap-2">
										<h3
											className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
										>
											{rule.title}
										</h3>
										<Icon
											className={`h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
										/>
									</div>
									<p
										className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
									>
										{rule.desc}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function PreviewVoting({ section }: { section: Section }) {
	const { colorScheme = 'default' } = section.settings;
	const isDark = colorScheme === 'dark';

	const sites = [
		{
			name: 'Planet Minecraft',
			votes: '2.4k',
			reward: '5 Diamonds',
			color: 'from-green-500 to-emerald-600',
		},
		{
			name: 'MC Server List',
			votes: '1.8k',
			reward: 'Vote Key',
			color: 'from-blue-500 to-indigo-600',
		},
		{
			name: 'TopG',
			votes: '956',
			reward: '$500 In-Game',
			color: 'from-amber-500 to-orange-600',
		},
	];

	return (
		<div
			className={`px-6 py-14 ${isDark ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/20' : 'bg-gradient-to-br from-amber-50 via-white to-orange-50'}`}
		>
			<div className="mx-auto max-w-5xl">
				<div className="mb-10 text-center">
					<div
						className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25`}
					>
						<Trophy className="h-7 w-7 text-white" />
					</div>
					<h2
						className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Vote & Earn Rewards'}
					</h2>
					<p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
						Support the server by voting daily and earn awesome rewards!
					</p>
				</div>

				<div className="grid grid-cols-3 gap-5">
					{sites.map((site, i) => (
						<div
							key={site.name}
							className={`group relative cursor-pointer overflow-hidden rounded-2xl p-5 text-center transition-all hover:-translate-y-1 ${
								isDark
									? 'border border-zinc-800 bg-zinc-800/50 hover:border-amber-500/50'
									: 'border border-zinc-200 bg-white shadow-sm hover:border-amber-300 hover:shadow-xl'
							}`}
						>
							{/* Rank badge */}
							<div
								className={`absolute top-3 left-3 h-6 w-6 rounded-full bg-gradient-to-br ${site.color} flex items-center justify-center text-xs font-bold text-white shadow-lg`}
							>
								{i + 1}
							</div>

							<div
								className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${site.color} shadow-lg transition-transform group-hover:scale-110`}
							>
								<Trophy className="h-7 w-7 text-white" />
							</div>

							<h3
								className={`mb-1 font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
							>
								{site.name}
							</h3>
							<p
								className={`mb-3 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}
							>
								{site.votes} votes
							</p>

							<div
								className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
									isDark
										? 'bg-amber-500/10 text-amber-400'
										: 'bg-amber-100 text-amber-700'
								}`}
							>
								<Star className="h-3 w-3" />
								{site.reward}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function PreviewStore({ section }: { section: Section }) {
	const { colorScheme = 'dark' } = section.settings;
	const isDark = colorScheme === 'dark';

	const ranks = [
		{
			name: 'VIP',
			price: '$9.99',
			perks: [
				'2x Money Multiplier',
				'5 Home Locations',
				'Colored Chat Name',
				'Access to /fly',
			],
			gradient: 'from-emerald-400 to-cyan-500',
		},
		{
			name: 'MVP',
			price: '$19.99',
			perks: [
				'5x Money Multiplier',
				'10 Home Locations',
				'Custom Join Message',
				'Exclusive Kits',
				'Priority Support',
			],
			gradient: 'from-indigo-500 to-purple-600',
			popular: true,
		},
		{
			name: 'Elite',
			price: '$29.99',
			perks: [
				'10x Money Multiplier',
				'Unlimited Homes',
				'All Previous Perks',
				'Beta Access',
				'Monthly Crate Keys',
			],
			gradient: 'from-amber-400 to-orange-500',
		},
	];

	return (
		<div
			className={`px-6 py-14 ${isDark ? 'bg-zinc-900' : 'bg-gradient-to-b from-zinc-50 to-white'}`}
		>
			<div className="mx-auto max-w-5xl">
				<div className="mb-10 text-center">
					<div
						className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
							isDark
								? 'bg-indigo-500/10 text-indigo-400'
								: 'bg-indigo-100 text-indigo-700'
						}`}
					>
						<ShoppingBag className="h-3.5 w-3.5" />
						Store
					</div>
					<h2
						className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Upgrade Your Experience'}
					</h2>
					<p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
						Support the server and unlock exclusive perks
					</p>
				</div>

				<div className="grid grid-cols-3 gap-5">
					{ranks.map((rank) => (
						<div
							key={rank.name}
							className={`relative overflow-hidden rounded-2xl transition-all hover:-translate-y-1 ${
								rank.popular ? 'z-10 scale-105' : ''
							}`}
						>
							{/* Popular banner */}
							{rank.popular && (
								<div className="absolute inset-x-0 top-0 bg-gradient-to-r from-indigo-600 to-purple-600 py-1.5 text-center text-xs font-bold text-white">
									MOST POPULAR
								</div>
							)}

							<div
								className={`h-full p-6 ${rank.popular ? 'pt-10' : ''} ${
									isDark
										? 'border border-zinc-700 bg-zinc-800'
										: 'border border-zinc-200 bg-white shadow-lg'
								} ${rank.popular ? (isDark ? 'border-indigo-500' : 'border-indigo-300 shadow-xl shadow-indigo-500/10') : ''} rounded-2xl`}
							>
								{/* Icon */}
								<div
									className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${rank.gradient} shadow-lg`}
								>
									<Crown className="h-8 w-8 text-white" />
								</div>

								<h3
									className={`mb-1 text-center text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
								>
									{rank.name}
								</h3>
								<p
									className={`mb-6 bg-gradient-to-r text-center text-3xl font-bold ${rank.gradient} bg-clip-text text-transparent`}
								>
									{rank.price}
								</p>

								<ul className="mb-6 space-y-3">
									{rank.perks.map((perk, i) => (
										<li
											key={i}
											className={`flex items-start gap-2.5 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
										>
											<Check
												className={`mt-0.5 h-4 w-4 flex-shrink-0 ${rank.popular ? 'text-indigo-500' : 'text-green-500'}`}
											/>
											{perk}
										</li>
									))}
								</ul>

								<button
									className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
										rank.popular
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30'
											: isDark
												? 'bg-zinc-700 text-white hover:bg-zinc-600'
												: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
									}`}
								>
									Purchase
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function PreviewReviews({ section }: { section: Section }) {
	const { colorScheme = 'default' } = section.settings;
	const isDark = colorScheme === 'dark';

	const reviews = [
		{
			name: 'CraftMaster99',
			text: "Best survival server I've ever played on! The community is amazing and the staff are super helpful. Been playing for 6 months now!",
			rating: 5,
			date: '2 days ago',
			gradient: 'from-emerald-500 to-cyan-500',
		},
		{
			name: 'BlockBuilder',
			text: 'Great performance, no lag even with 200+ players. The custom plugins are really well made.',
			rating: 5,
			date: '1 week ago',
			gradient: 'from-violet-500 to-purple-500',
		},
		{
			name: 'MinecraftPro2024',
			text: 'Love the events and the active Discord community. Staff responds within minutes!',
			rating: 4,
			date: '2 weeks ago',
			gradient: 'from-amber-500 to-orange-500',
		},
	];

	const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

	return (
		<div className={`px-6 py-14 ${isDark ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
			<div className="mx-auto max-w-5xl">
				<div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div>
						<h2
							className={`mb-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
						>
							{section.title || 'What Players Say'}
						</h2>
						<p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
							Real reviews from our community
						</p>
					</div>

					{/* Rating summary */}
					<div
						className={`flex items-center gap-4 rounded-2xl px-5 py-3 ${
							isDark ? 'bg-zinc-800' : 'border border-zinc-200 bg-white shadow-sm'
						}`}
					>
						<div className="text-center">
							<div
								className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
							>
								{avgRating}
							</div>
							<div className="mt-1 flex gap-0.5">
								{[1, 2, 3, 4, 5].map((i) => (
									<Star
										key={i}
										className={`h-4 w-4 ${i <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
									/>
								))}
							</div>
						</div>
						<div className={`h-10 w-px ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`} />
						<div className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
							Based on{' '}
							<span
								className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}
							>
								127
							</span>{' '}
							reviews
						</div>
					</div>
				</div>

				<div className="grid gap-5 md:grid-cols-3">
					{reviews.map((review, i) => (
						<div
							key={i}
							className={`rounded-2xl p-5 transition-all hover:-translate-y-1 ${
								isDark
									? 'border border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
									: 'border border-zinc-200 bg-white shadow-sm hover:shadow-lg'
							}`}
						>
							{/* Stars */}
							<div className="mb-4 flex gap-0.5">
								{[...Array(5)].map((_, j) => (
									<Star
										key={j}
										className={`h-4 w-4 ${j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
									/>
								))}
							</div>

							<p
								className={`mb-4 text-sm leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
							>
								"{review.text}"
							</p>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2.5">
									<div
										className={`h-9 w-9 rounded-xl bg-gradient-to-br ${review.gradient} flex items-center justify-center shadow-lg`}
									>
										<span className="text-sm font-bold text-white">
											{review.name[0]}
										</span>
									</div>
									<span
										className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}
									>
										{review.name}
									</span>
								</div>
								<span
									className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
								>
									{review.date}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function PreviewFaq({ section }: { section: Section }) {
	const { colorScheme = 'default' } = section.settings;
	const isDark = colorScheme === 'dark';

	const faqs = [
		{
			q: 'How do I join the server?',
			a: 'Simply add our IP address to your Minecraft server list and connect! We support both Java and Bedrock editions.',
			icon: Server,
		},
		{
			q: 'What Minecraft version is supported?',
			a: `We currently support 1.20.4 and above. We recommend using the latest version for the best experience.`,
			icon: Zap,
		},
		{
			q: 'Is the server free to play?',
			a: 'Yes! The server is completely free to play. We offer optional ranks and cosmetics to support server costs.',
			icon: Star,
		},
		{
			q: 'How can I report a player?',
			a: 'You can report players using /report in-game or through our Discord server. Staff will review reports within 24 hours.',
			icon: Shield,
		},
	];

	return (
		<div className={`px-6 py-14 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
			<div className="mx-auto max-w-4xl">
				<div className="mb-10 text-center">
					<div
						className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
							isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'
						}`}
					>
						<HelpCircle className="h-7 w-7 text-indigo-500" />
					</div>
					<h2
						className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Frequently Asked Questions'}
					</h2>
					<p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
						Got questions? We've got answers
					</p>
				</div>

				<div className="space-y-4">
					{faqs.map((faq, i) => {
						const Icon = faq.icon;
						return (
							<div
								key={i}
								className={`group overflow-hidden rounded-2xl transition-all ${
									isDark
										? 'border border-zinc-800 bg-zinc-800/50 hover:border-zinc-700'
										: 'border border-zinc-100 bg-zinc-50 hover:border-zinc-200 hover:shadow-sm'
								}`}
							>
								<div className={`flex cursor-pointer items-center gap-4 p-5`}>
									<div
										className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
											isDark ? 'bg-zinc-700' : 'bg-white shadow-sm'
										}`}
									>
										<Icon
											className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}
										/>
									</div>
									<span
										className={`flex-1 font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}
									>
										{faq.q}
									</span>
									<ChevronDown
										className={`h-5 w-5 transition-transform group-hover:rotate-180 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
									/>
								</div>
								<div className={`px-5 pt-0 pb-5`}>
									<div className={`pl-14`}>
										<p
											className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
										>
											{faq.a}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function PreviewVideo({ section }: { section: Section }) {
	const { colorScheme = 'dark' } = section.settings;
	const isDark = colorScheme === 'dark';

	return (
		<div
			className={`px-6 py-14 ${isDark ? 'bg-zinc-900' : 'bg-gradient-to-b from-zinc-50 to-white'}`}
		>
			<div className="mx-auto max-w-5xl">
				<div className="mb-8 text-center">
					<h2
						className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Watch Our Trailer'}
					</h2>
					<p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
						See what makes our server special
					</p>
				</div>

				<div
					className={`group relative aspect-video cursor-pointer overflow-hidden rounded-3xl shadow-2xl ${
						isDark ? 'shadow-black/50' : 'shadow-zinc-300/50'
					}`}
				>
					{/* Thumbnail background */}
					<div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
						{/* Pattern overlay */}
						<div
							className="absolute inset-0 opacity-20"
							style={{
								backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
							}}
						/>
					</div>

					{/* Gradient overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

					{/* Play button */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="relative">
							{/* Pulse effect */}
							<div
								className="absolute inset-0 animate-ping rounded-full bg-white/30"
								style={{ animationDuration: '2s' }}
							/>
							<div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-2xl transition-transform group-hover:scale-110">
								<Play className="ml-1 h-8 w-8 fill-indigo-600 text-indigo-600" />
							</div>
						</div>
					</div>

					{/* Video info */}
					<div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
						<div>
							<p className="mb-1 text-lg font-bold text-white">
								Official Server Trailer
							</p>
							<p className="text-sm text-white/60">Experience the adventure</p>
						</div>
						<div className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur-sm">
							<Play className="h-4 w-4 text-white" />
							<span className="text-sm font-medium text-white">2:34</span>
						</div>
					</div>

					{/* YouTube-like progress bar */}
					<div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
						<div className="h-full w-0 bg-red-500 transition-all duration-500 group-hover:w-1/4" />
					</div>
				</div>
			</div>
		</div>
	);
}

function SectionPreview({ section, serverData }: { section: Section; serverData: WebsiteData }) {
	const entry = SECTION_REGISTRY[section.type as SectionType];
	if (!entry) {
		return (
			<div className="bg-zinc-100 p-6 text-center text-sm text-zinc-500">
				{section.type} section preview
			</div>
		);
	}
	return <entry.render section={section} serverData={serverData} />;
}

// Settings Panel Components
function SettingsPanel({
	section,
	onUpdate,
}: {
	section: Section;
	onUpdate: (updates: Partial<Section>) => void;
}) {
	const config = sectionTypeConfig[section.type];
	if (!config) return null;

	return (
		<div className="space-y-4">
			{/* Section Title - not shown for sections that use HeaderSettingsPanel */}
			{!['features', 'discord', 'stats', 'gallery', 'gamemodes', 'staff', 'text'].includes(
				section.type,
			) && (
				<div>
					<label className="settings-label">Title</label>
					<input
						type="text"
						placeholder="Enter title..."
						value={section.title ?? ''}
						onChange={(e) => onUpdate({ title: e.target.value })}
						className="input-field mt-2"
					/>
				</div>
			)}

			{/* Section-specific settings — dispatched via registry */}
			{(() => {
				const entry = SECTION_REGISTRY[section.type as SectionType];
				if (!entry) return null;
				const Settings = entry.settings;
				return <Settings section={section} onUpdate={onUpdate} />;
			})()}
		</div>
	);
}

type NavbarSettings = {
	links: { label: string; href: string }[];
	showLogo: boolean;
	style: 'default' | 'centered' | 'minimal';
};

const initialNavbarSettings: NavbarSettings = {
	links: [
		{ label: 'Home', href: '/' },
		{ label: 'Servers', href: '/servers' },
		{ label: 'Store', href: '/store' },
		{ label: 'Discord', href: '/discord' },
	],
	showLogo: true,
	style: 'default',
};

export default function ServerEditorPage() {
	const params = useParams();
	const websiteId = params.websiteId as string;

	type WebsiteDataState = {
		id: string;
		name: string;
		subdomain: string;
		description: string;
		published: boolean;
		players: number;
		maxPlayers: number;
		version: string;
	};

	const [sections, setSectionsInternal] = useState<Section[]>([]);
	const [history, setHistory] = useState<Section[][]>([]);
	const [future, setFuture] = useState<Section[][]>([]);
	const [navbarSettings, setNavbarSettings] = useState<NavbarSettings>(initialNavbarSettings);
	const [themeSettings, setThemeSettings] = useState<SiteTheme>(DEFAULT_THEME);
	const [sidebarTab, setSidebarTab] = useState<'sections' | 'appearance'>('sections');
	const [selectedSection, setSelectedSection] = useState<string | null>(null);
	const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
	const [showAddSection, setShowAddSection] = useState(false);
	const [expandedCategory, setExpandedCategory] = useState<string>('Essential');

	// Server data state
	const [serverData, setServerData] = useState<WebsiteDataState | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [connectionsOpen, setConnectionsOpen] = useState(false);

	// Load server data on mount
	useEffect(() => {
		const loadServerData = async () => {
			try {
				const response = await fetch(`/api/websites/${websiteId}`);
				if (!response.ok) {
					throw new Error('Failed to load server data');
				}

				const data = await response.json();

				setServerData({
					id: data.id,
					name: data.name,
					subdomain: data.subdomain,
					description: data.description || '',
					published: data.published || false,
					players: 0, // Would come from a live status API
					maxPlayers: 500,
					version: '1.20.4',
				});

				if (data.navbar && typeof data.navbar === 'object') {
					setNavbarSettings({
						...initialNavbarSettings,
						...(data.navbar as Partial<NavbarSettings>),
					});
				}

				if (data.theme && typeof data.theme === 'object') {
					setThemeSettings({ ...DEFAULT_THEME, ...(data.theme as Partial<SiteTheme>) });
				}

				const loadedSections: Section[] = (data.sections ?? []).map(
					(s: {
						id: string;
						type: string;
						title?: string | null;
						subtitle?: string | null;
						settings?: Record<string, unknown>;
						visible?: boolean;
					}) => ({
						id: s.id,
						type: s.type,
						title: s.title ?? '',
						subtitle: s.subtitle ?? null,
						visible: s.visible ?? true,
						settings: s.settings ?? {},
					}),
				);
				setSectionsInternal(loadedSections);
				setSelectedSection(loadedSections[0]?.id ?? null);
			} catch (error) {
				console.error('Error loading server:', error);
				setLoadError(error instanceof Error ? error.message : 'Failed to load server');
			} finally {
				setIsLoading(false);
			}
		};

		loadServerData();
	}, [websiteId]);

	// Ref to the preview panel .site-root wrapper for live CSS var mutation
	const previewRootRef = useRef<HTMLDivElement>(null);

	// Track unsaved changes by comparing to saved state
	const savedStateRef = useRef<{ sections: string; navbar: string; theme: string } | null>(null);

	// Store saved state after initial load
	useEffect(() => {
		if (!isLoading && savedStateRef.current === null) {
			savedStateRef.current = {
				sections: JSON.stringify(sections),
				navbar: JSON.stringify(navbarSettings),
				theme: JSON.stringify(themeSettings),
			};
		}
	}, [isLoading, sections, navbarSettings, themeSettings]);

	// Compare current state to saved state
	useEffect(() => {
		if (!isLoading && savedStateRef.current !== null) {
			const currentSections = JSON.stringify(sections);
			const currentNavbar = JSON.stringify(navbarSettings);
			const currentTheme = JSON.stringify(themeSettings);
			const hasChanges =
				currentSections !== savedStateRef.current.sections ||
				currentNavbar !== savedStateRef.current.navbar ||
				currentTheme !== savedStateRef.current.theme;
			setHasUnsavedChanges(hasChanges);
		}
	}, [sections, navbarSettings, themeSettings, isLoading]);

	// Save function
	const saveServer = useCallback(async () => {
		if (!serverData) return;
		setIsSaving(true);
		setSaveError(null);

		try {
			// WR-07: scope the editor save body to the fields the editor actually
			// owns (navbar, theme, sections). Name/subdomain/description are edited
			// in the settings form (server-settings.tsx) and have their own server
			// action. Sending them on every editor save coupled validation failures
			// on those fields (e.g. a legacy subdomain that violates the current
			// regex) to unrelated section edits.
			const response = await fetch(`/api/websites/${websiteId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					navbar: navbarSettings,
					theme: themeSettings,
					sections: sections.map((s, index) => ({
						id: s.id,
						type: s.type,
						title: s.title,
						subtitle: s.subtitle,
						settings: s.settings,
						visible: s.visible,
						order: index,
					})),
				}),
			});

			if (!response.ok) {
				// WR-04: surface the server's error envelope in the toast instead of
				// collapsing every non-OK status to a generic "Failed to save". The
				// route returns { error, details? } for 400/403/409/500, so reading
				// the JSON body and preferring `error` gives the user a specific
				// message (e.g. "Free plan is limited to 5 sections" for 403).
				let serverMessage = 'Failed to save';
				try {
					const errorBody = await response.json();
					if (errorBody && typeof errorBody.error === 'string') {
						serverMessage = errorBody.error;
					}
				} catch {
					// Body wasn't JSON — keep the default message.
				}
				throw new Error(serverMessage);
			}

			// Update saved state ref to current state
			savedStateRef.current = {
				sections: JSON.stringify(sections),
				navbar: JSON.stringify(navbarSettings),
				theme: JSON.stringify(themeSettings),
			};
			setHasUnsavedChanges(false);
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : 'Failed to save');
		} finally {
			setIsSaving(false);
		}
	}, [websiteId, serverData, navbarSettings, themeSettings, sections]);

	// Track changes for undo/redo
	const setSections = (newSections: Section[] | ((prev: Section[]) => Section[])) => {
		const resolved = typeof newSections === 'function' ? newSections(sections) : newSections;
		setHistory((prev) => [...prev.slice(-19), sections]); // Keep last 20 states
		setFuture([]);
		setSectionsInternal(resolved);
	};

	const undo = () => {
		if (history.length === 0) return;
		const prev = history[history.length - 1];
		setHistory((h) => h.slice(0, -1));
		setFuture((f) => [sections, ...f]);
		setSectionsInternal(prev);
	};

	const redo = () => {
		if (future.length === 0) return;
		const next = future[0];
		setFuture((f) => f.slice(1));
		setHistory((h) => [...h, sections]);
		setSectionsInternal(next);
	};

	const canUndo = history.length > 0;
	const canRedo = future.length > 0;

	const visibleSections = sections.filter((s) => s.visible);
	const selectedSectionData = sections.find((s) => s.id === selectedSection);

	const toggleVisibility = (id: string) => {
		setSections(sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
	};

	const deleteSection = (id: string) => {
		setSections(sections.filter((s) => s.id !== id));
		if (selectedSection === id) setSelectedSection(null);
	};

	const addSection = (type: string) => {
		const config = sectionTypeConfig[type];
		const newSection: Section = {
			id: crypto.randomUUID(),
			type,
			title: config?.label || `New ${type} section`,
			subtitle: null,
			visible: true,
			settings: {},
		};
		setSections([...sections, newSection]);
		setSelectedSection(newSection.id);
		setShowAddSection(false);

		// Scroll to the new section after render
		setTimeout(() => {
			const element = document.querySelector(`[data-section-id="${newSection.id}"]`);
			element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}, 100);
	};

	const updateSection = (id: string, updates: Partial<Section>) => {
		setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
	};

	const previewWidth = {
		desktop: '100%',
		tablet: '768px',
		mobile: '375px',
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="-m-6 flex h-[calc(100vh-64px)] items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
					<p className="text-zinc-500">Loading editor...</p>
				</div>
			</div>
		);
	}

	// Error state
	if (loadError) {
		return (
			<div className="-m-6 flex h-[calc(100vh-64px)] items-center justify-center">
				<div className="flex flex-col items-center gap-3 text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
						<X className="h-6 w-6 text-red-500" />
					</div>
					<p className="font-medium text-zinc-900">Failed to load server</p>
					<p className="text-sm text-zinc-500">{loadError}</p>
					<Link
						href="/dashboard"
						className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800"
					>
						Back to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	if (!serverData) return null;

	return (
		<div className="-m-6 flex h-[calc(100vh-64px)] flex-col overflow-hidden p-4">
			{/* Breadcrumb */}
			<div className="mb-2 flex flex-shrink-0 items-center gap-2 text-sm">
				<Link
					href="/dashboard"
					className="text-zinc-400 transition-colors hover:text-zinc-600"
				>
					Dashboard
				</Link>
				<ChevronRight className="h-4 w-4 text-zinc-300" />
				<Link
					href="/dashboard/servers"
					className="text-zinc-400 transition-colors hover:text-zinc-600"
				>
					Servers
				</Link>
				<ChevronRight className="h-4 w-4 text-zinc-300" />
				<span className="font-medium text-zinc-900">{serverData.name}</span>
			</div>

			{/* Header */}
			<div className="mb-3 flex flex-shrink-0 items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500">
						<Sparkles className="h-5 w-5 text-white" />
					</div>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="font-display text-xl font-bold text-zinc-900">
								{serverData.name}
							</h1>
							<span
								className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
									serverData.published
										? 'bg-emerald-50 text-emerald-600'
										: 'bg-zinc-100 text-zinc-500'
								}`}
							>
								<span
									className={`h-1.5 w-1.5 rounded-full ${
										serverData.published ? 'bg-emerald-500' : 'bg-zinc-400'
									}`}
								/>
								{serverData.published ? 'Live' : 'Draft'}
							</span>
						</div>
						<p className="text-sm text-zinc-500">
							{serverData.subdomain}.minesites.net
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{hasUnsavedChanges && (
						<span className="rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-600">
							Unsaved changes
						</span>
					)}
					{/*
            WR-07: align the "Manage Servers" trigger with UI-SPEC §Interaction
            Contracts ("secondary — white bg, zinc border, Server icon left of
            label"). We deliberately keep the raw motion.button rather than
            adopting the Button primitive — the surrounding Preview/Publish
            buttons in this cluster are also raw motion.button carry-forwards,
            and pulling in <Button> here would diverge from the established
            pattern. Per UI-SPEC §Typography Phase 8 NEW components use
            `font-normal` (the analog Preview/Publish carry-forward uses
            `font-medium`).
          */}
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => setConnectionsOpen(true)}
						className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
					>
						<Server className="h-4 w-4" />
						Manage Servers
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={() =>
							window.open(`/${serverData.subdomain}?preview=true`, '_blank')
						}
						className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
					>
						<ExternalLink className="h-4 w-4" />
						Preview
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.02, y: -1 }}
						whileTap={{ scale: 0.98 }}
						onClick={saveServer}
						disabled={isSaving}
						className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white transition-shadow hover:shadow-lg hover:shadow-cyan-200/50 disabled:opacity-50"
					>
						{isSaving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						{isSaving ? 'Saving...' : 'Publish'}
					</motion.button>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 gap-0">
				{/* Main Editor Container */}
				<div className="flex flex-1 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
					{/* Sections / Appearance Sidebar */}
					<div className="flex w-56 flex-shrink-0 flex-col overflow-hidden border-r border-zinc-100 px-2.5 py-3 xl:w-72 xl:px-3">
						{/* Tab toggle: Sections | Appearance */}
						<div className="mb-3 flex items-center gap-1 rounded-lg bg-zinc-100 p-0.5">
							<button
								onClick={() => setSidebarTab('sections')}
								className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${
									sidebarTab === 'sections'
										? 'bg-white text-zinc-900 shadow-sm'
										: 'text-zinc-500 hover:text-zinc-700'
								}`}
							>
								Sections
							</button>
							<button
								onClick={() => setSidebarTab('appearance')}
								className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${
									sidebarTab === 'appearance'
										? 'bg-white text-zinc-900 shadow-sm'
										: 'text-zinc-500 hover:text-zinc-700'
								}`}
							>
								Appearance
							</button>
						</div>

						{sidebarTab === 'appearance' ? (
							<div className="scrollbar-thin flex-1 overflow-y-auto">
								<AppearanceTab
									themeSettings={themeSettings}
									setThemeSettings={setThemeSettings}
									previewRootRef={previewRootRef}
									onSave={saveServer}
									isSaving={isSaving}
								/>
							</div>
						) : (
							<>
								<div className="mb-2 flex items-center justify-between">
									<div className="flex items-center gap-1.5">
										<Layers className="h-4 w-4 text-zinc-400" />
										<h2 className="text-sm font-semibold text-zinc-900">
											Sections
										</h2>
									</div>
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => setShowAddSection(true)}
										className="rounded-md bg-gradient-to-r from-cyan-500 to-emerald-500 p-1.5 text-white transition-shadow hover:shadow-md"
									>
										<Plus className="h-4 w-4" />
									</motion.button>
								</div>

								<div className="scrollbar-thin flex-1 overflow-y-auto">
									{/* Locked Navbar Section */}
									<div
										onClick={() => setSelectedSection('navbar')}
										className={`mb-1.5 flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 transition-all ${
											selectedSection === 'navbar'
												? 'border-cyan-300 bg-gradient-to-r from-cyan-50 to-emerald-50'
												: 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
										}`}
									>
										<div className="flex-shrink-0 text-zinc-300">
											<div className="h-3.5 w-3.5" />{' '}
											{/* Spacer where grip would be */}
										</div>
										<div
											className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${
												selectedSection === 'navbar'
													? 'bg-gradient-to-br from-cyan-500 to-emerald-500'
													: 'bg-zinc-200'
											}`}
										>
											<Layout
												className={`h-3 w-3 ${selectedSection === 'navbar' ? 'text-white' : 'text-zinc-500'}`}
											/>
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-zinc-900">
												Navigation
											</p>
											<p className="text-[11px] text-zinc-400">Locked</p>
										</div>
									</div>

									<Reorder.Group
										axis="y"
										values={sections}
										onReorder={setSections}
										className="space-y-1"
									>
										{sections.map((section) => {
											const config = sectionTypeConfig[section.type];
											const Icon = config?.icon || Layout;
											const isSelected = selectedSection === section.id;

											return (
												<Reorder.Item key={section.id} value={section}>
													<motion.div
														onClick={() =>
															setSelectedSection(
																isSelected ? null : section.id,
															)
														}
														title={section.title ?? ''}
														className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 transition-all ${
															isSelected
																? 'border-cyan-300 bg-gradient-to-r from-cyan-50 to-emerald-50'
																: 'border-transparent hover:border-zinc-200 hover:bg-zinc-50'
														} ${!section.visible ? 'opacity-50' : ''}`}
													>
														<div className="flex-shrink-0 cursor-grab text-zinc-300 hover:text-zinc-400">
															<GripVertical className="h-3.5 w-3.5" />
														</div>
														<div
															className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${
																isSelected
																	? 'bg-gradient-to-br from-cyan-500 to-emerald-500'
																	: section.visible
																		? 'bg-zinc-100'
																		: 'bg-zinc-200'
															}`}
														>
															<Icon
																className={`h-3 w-3 ${isSelected ? 'text-white' : 'text-zinc-500'}`}
															/>
														</div>
														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-medium text-zinc-900">
																{section.title}
															</p>
															<p className="text-[11px] text-zinc-400 capitalize">
																{section.type}
															</p>
														</div>
														<div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
															<motion.button
																whileHover={{ scale: 1.1 }}
																whileTap={{ scale: 0.9 }}
																onClick={(e) => {
																	e.stopPropagation();
																	toggleVisibility(section.id);
																}}
																className="rounded p-1 transition-colors hover:bg-white"
															>
																{section.visible ? (
																	<Eye className="h-3 w-3 text-zinc-400" />
																) : (
																	<EyeOff className="h-3 w-3 text-zinc-400" />
																)}
															</motion.button>
															<motion.button
																whileHover={{ scale: 1.1 }}
																whileTap={{ scale: 0.9 }}
																onClick={(e) => {
																	e.stopPropagation();
																	deleteSection(section.id);
																}}
																className="rounded p-1 transition-colors hover:bg-red-50"
															>
																<Trash2 className="h-3 w-3 text-zinc-400 hover:text-red-500" />
															</motion.button>
														</div>
													</motion.div>
												</Reorder.Item>
											);
										})}
									</Reorder.Group>

									{sections.length === 0 && (
										<div className="py-6 text-center text-xs text-zinc-400">
											No sections yet
										</div>
									)}
								</div>
							</>
						)}
					</div>

					{/* Fading Divider Left */}
					<div className="relative my-4 w-px flex-shrink-0">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-200 to-transparent" />
					</div>

					{/* Preview Panel */}
					<div className="flex flex-1 flex-col overflow-hidden">
						{/* Preview Header */}
						<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
							<div className="flex items-center gap-2">
								<Eye className="h-4 w-4 text-zinc-400" />
								<span className="text-sm font-medium text-zinc-700">Preview</span>
								<span className="text-xs text-zinc-400">•</span>
								<span className="text-xs text-zinc-500">
									{serverData.subdomain}.minesites.net
								</span>
							</div>
							<div className="flex items-center gap-3">
								{/* Undo/Redo */}
								<div className="flex items-center gap-1">
									<motion.button
										whileHover={canUndo ? { scale: 1.05 } : {}}
										whileTap={canUndo ? { scale: 0.95 } : {}}
										onClick={undo}
										disabled={!canUndo}
										className={`rounded-md p-1.5 transition-colors ${
											canUndo
												? 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
												: 'cursor-not-allowed text-zinc-300'
										}`}
										title="Undo"
									>
										<Undo2 className="h-4 w-4" />
									</motion.button>
									<motion.button
										whileHover={canRedo ? { scale: 1.05 } : {}}
										whileTap={canRedo ? { scale: 0.95 } : {}}
										onClick={redo}
										disabled={!canRedo}
										className={`rounded-md p-1.5 transition-colors ${
											canRedo
												? 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
												: 'cursor-not-allowed text-zinc-300'
										}`}
										title="Redo"
									>
										<Redo2 className="h-4 w-4" />
									</motion.button>
								</div>
								{/* Device Mode */}
								<div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
									{[
										{ mode: 'desktop' as const, icon: Monitor },
										{ mode: 'tablet' as const, icon: Tablet },
										{ mode: 'mobile' as const, icon: Smartphone },
									].map(({ mode, icon: Icon }) => (
										<motion.button
											key={mode}
											whileTap={{ scale: 0.95 }}
											onClick={() => setPreviewMode(mode)}
											className={`rounded-md p-1.5 transition-all ${
												previewMode === mode
													? 'bg-white text-cyan-600 shadow-sm'
													: 'text-zinc-400 hover:text-zinc-600'
											}`}
										>
											<Icon className="h-4 w-4" />
										</motion.button>
									))}
								</div>
							</div>
						</div>

						{/* Preview Content */}
						<div className="scrollbar-thin flex flex-1 justify-center overflow-y-auto bg-[#f0f0f0] p-4">
							<motion.div
								ref={previewRootRef}
								animate={{ width: previewWidth[previewMode] }}
								transition={{ duration: 0.3, ease: 'easeInOut' }}
								className="site-root h-fit max-w-full overflow-hidden rounded-lg bg-white shadow-xl"
								data-theme={themeSettings.palette}
								style={
									{
										'--site-accent': THEME_PRESETS[themeSettings.palette],
										'--site-bg': '#0e0e10',
										'--site-card': '#1a1a1f',
										'--site-text': '#f4f4f5',
										'--site-text-muted': '#a1a1aa',
										'--site-font-display': FONT_FAMILY_MAP[themeSettings.font],
									} as React.CSSProperties
								}
							>
								{/* Navbar - clickable to edit */}
								<div
									onClick={() => setSelectedSection('navbar')}
									className={`group relative flex items-center ${
										navbarSettings.style === 'centered'
											? 'justify-center'
											: 'justify-between'
									} sticky top-0 cursor-pointer border-b border-zinc-200 bg-white px-4 py-2.5`}
								>
									{navbarSettings.style !== 'minimal' &&
										navbarSettings.showLogo && (
											<div
												className={`flex items-center gap-2 ${navbarSettings.style === 'centered' ? 'absolute left-4' : ''}`}
											>
												<div className="h-6 w-6 rounded bg-gradient-to-br from-emerald-500 to-cyan-500" />
												{navbarSettings.style !== 'centered' && (
													<span className="text-sm font-bold text-zinc-800">
														{serverData.name}
													</span>
												)}
											</div>
										)}
									{previewMode !== 'mobile' && (
										<div
											className={`flex gap-4 text-xs text-zinc-500 ${
												navbarSettings.style === 'centered' ? '' : ''
											}`}
										>
											{navbarSettings.links.map((link, i) => (
												<span key={i}>{link.label}</span>
											))}
										</div>
									)}
									{/* Hover/Selected border overlay */}
									<div
										className={`pointer-events-none absolute inset-0 border-2 transition-all ${
											selectedSection === 'navbar'
												? 'border-cyan-400'
												: 'border-transparent group-hover:border-cyan-300'
										}`}
									/>
									{selectedSection === 'navbar' && (
										<div className="absolute top-1 right-2 z-10 rounded bg-cyan-500 px-2 py-0.5 text-[10px] font-medium text-white">
											Editing
										</div>
									)}
								</div>

								{/* Sections */}
								<AnimatePresence mode="popLayout">
									{visibleSections.length === 0 ? (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="p-16 text-center"
										>
											<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
												<Layers className="h-6 w-6 text-zinc-300" />
											</div>
											<p className="text-sm text-zinc-400">
												No visible sections
											</p>
											<p className="mt-1 text-xs text-zinc-300">
												Add or enable sections to preview
											</p>
										</motion.div>
									) : (
										visibleSections.map((section) => (
											<motion.div
												key={section.id}
												data-section-id={section.id}
												layout
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -20 }}
												onClick={() => setSelectedSection(section.id)}
												className="group relative cursor-pointer"
											>
												<SectionPreview
													section={section}
													serverData={{
														name: serverData.name,
														subdomain: serverData.subdomain,
														players: serverData.players,
														maxPlayers: serverData.maxPlayers,
														version: serverData.version,
													}}
												/>
												{/* Hover/Selected border overlay */}
												<div
													className={`pointer-events-none absolute inset-0 border-2 transition-all ${
														selectedSection === section.id
															? 'border-cyan-400'
															: 'border-transparent group-hover:border-cyan-300'
													}`}
												/>
												{selectedSection === section.id && (
													<div className="absolute top-2 right-2 z-10 rounded-md bg-cyan-500 px-2 py-1 text-xs font-medium text-white shadow-lg">
														Editing
													</div>
												)}
											</motion.div>
										))
									)}
								</AnimatePresence>

								{/* Mini Footer */}
								<div className="border-t border-zinc-100 bg-white px-4 py-3 text-center">
									<p className="text-xs text-zinc-400">
										Powered by{' '}
										<span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text font-medium text-transparent">
											MineSites
										</span>
									</p>
								</div>
							</motion.div>
						</div>
					</div>

					{/* Fading Divider Right */}
					<div className="relative my-4 w-px flex-shrink-0">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-200 to-transparent" />
					</div>

					{/* Settings Panel */}
					<div className="flex w-56 flex-shrink-0 flex-col overflow-hidden p-3 xl:w-72 xl:p-4">
						<div className="mb-3 flex items-center gap-2">
							<Palette className="h-4 w-4 text-zinc-400" />
							<h2 className="text-sm font-semibold text-zinc-900">Settings</h2>
						</div>

						<div className="relative min-h-0 flex-1">
							{/* Top fade */}
							<div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-4 bg-gradient-to-b from-white to-transparent" />
							{/* Bottom fade */}
							<div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-4 bg-gradient-to-t from-white to-transparent" />

							<div className="scrollbar-none h-full overflow-y-auto py-2">
								{selectedSection === 'navbar' ? (
									<div className="space-y-4">
										{/* Navbar Style */}
										<div>
											<label className="settings-label">Style</label>
											<div className="grid grid-cols-3 gap-2">
												{[
													{ value: 'default', label: 'Default' },
													{ value: 'centered', label: 'Centered' },
													{ value: 'minimal', label: 'Minimal' },
												].map(({ value, label }) => (
													<button
														key={value}
														onClick={() =>
															setNavbarSettings({
																...navbarSettings,
																style: value as NavbarSettings['style'],
															})
														}
														className={`rounded-lg border p-2 text-center transition-all ${
															navbarSettings.style === value
																? 'border-cyan-300 bg-cyan-50 text-cyan-600'
																: 'border-zinc-200 text-zinc-500 hover:border-zinc-300'
														}`}
													>
														<span className="text-xs font-medium">
															{label}
														</span>
													</button>
												))}
											</div>
										</div>

										{/* Show Logo Toggle */}
										<div className="flex items-center justify-between">
											<label className="settings-label">Show Logo</label>
											<button
												onClick={() =>
													setNavbarSettings({
														...navbarSettings,
														showLogo: !navbarSettings.showLogo,
													})
												}
												className={`h-6 w-10 rounded-full transition-colors ${
													navbarSettings.showLogo
														? 'bg-cyan-500'
														: 'bg-zinc-300'
												}`}
											>
												<div
													className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
														navbarSettings.showLogo
															? 'translate-x-4.5'
															: 'translate-x-0.5'
													}`}
												/>
											</button>
										</div>

										{/* Navigation Links */}
										<div>
											<label className="settings-label">Links</label>
											<div className="space-y-2">
												{navbarSettings.links.map((link, i) => (
													<div key={i} className="flex gap-2">
														<input
															type="text"
															value={link.label}
															onChange={(e) => {
																const newLinks = [
																	...navbarSettings.links,
																];
																newLinks[i] = {
																	...newLinks[i],
																	label: e.target.value,
																};
																setNavbarSettings({
																	...navbarSettings,
																	links: newLinks,
																});
															}}
															placeholder="Label"
															className="input-field flex-1"
														/>
														<button
															onClick={() => {
																const newLinks =
																	navbarSettings.links.filter(
																		(_, idx) => idx !== i,
																	);
																setNavbarSettings({
																	...navbarSettings,
																	links: newLinks,
																});
															}}
															className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
														>
															<X className="h-4 w-4" />
														</button>
													</div>
												))}
												{navbarSettings.links.length < 6 && (
													<button
														onClick={() => {
															setNavbarSettings({
																...navbarSettings,
																links: [
																	...navbarSettings.links,
																	{
																		label: 'New Link',
																		href: '/',
																	},
																],
															});
														}}
														className="w-full rounded-lg border border-dashed border-zinc-300 p-2 text-xs text-zinc-500 transition-colors hover:border-cyan-300 hover:text-cyan-600"
													>
														+ Add Link
													</button>
												)}
											</div>
										</div>
									</div>
								) : selectedSectionData ? (
									<SettingsPanel
										section={selectedSectionData}
										onUpdate={(updates) =>
											updateSection(selectedSectionData.id, updates)
										}
									/>
								) : (
									<div className="flex h-full flex-col items-center justify-center text-center">
										<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
											<Type className="h-5 w-5 text-zinc-300" />
										</div>
										<p className="text-sm text-zinc-400">No section selected</p>
										<p className="mt-1 text-xs text-zinc-300">
											Click a section to edit
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Delete Section - at bottom */}
						{selectedSectionData && (
							<div className="mt-3 border-t border-zinc-100 pt-3">
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => deleteSection(selectedSectionData.id)}
									className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
								>
									<Trash2 className="h-4 w-4" />
									Delete Section
								</motion.button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Add Section Modal */}
			<AnimatePresence>
				{showAddSection && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
						onClick={() => setShowAddSection(false)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							onClick={(e) => e.stopPropagation()}
							className="flex h-[520px] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
						>
							{/* Header */}
							<div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-100 px-6 py-5">
								<div>
									<h3 className="text-lg font-semibold text-zinc-900">
										Add Section
									</h3>
									<p className="mt-0.5 text-sm text-zinc-500">
										Choose a section to add to your page
									</p>
								</div>
								<button
									onClick={() => setShowAddSection(false)}
									className="rounded-lg p-2 transition-colors hover:bg-zinc-100"
								>
									<X className="h-5 w-5 text-zinc-400" />
								</button>
							</div>

							{/* Content */}
							<div className="scrollbar-thin flex-1 overflow-y-auto">
								{sectionCategories.map((category, categoryIndex) => {
									const categorySections = Object.entries(
										sectionTypeConfig,
									).filter(
										([, config]) =>
											config.category === category && !config.locked,
									);
									if (categorySections.length === 0) return null;

									const isExpanded = expandedCategory === category;
									const categoryColors = [
										{
											bg: 'bg-gradient-to-br from-cyan-500 to-teal-500',
											light: 'bg-cyan-50/50',
											border: 'border-cyan-200/60',
											text: 'text-cyan-600',
											dot: 'bg-cyan-500',
										},
										{
											bg: 'bg-gradient-to-br from-violet-500 to-purple-500',
											light: 'bg-violet-50/50',
											border: 'border-violet-200/60',
											text: 'text-violet-600',
											dot: 'bg-violet-500',
										},
										{
											bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
											light: 'bg-amber-50/50',
											border: 'border-amber-200/60',
											text: 'text-amber-600',
											dot: 'bg-amber-500',
										},
										{
											bg: 'bg-gradient-to-br from-emerald-500 to-green-500',
											light: 'bg-emerald-50/50',
											border: 'border-emerald-200/60',
											text: 'text-emerald-600',
											dot: 'bg-emerald-500',
										},
										{
											bg: 'bg-gradient-to-br from-rose-500 to-pink-500',
											light: 'bg-rose-50/50',
											border: 'border-rose-200/60',
											text: 'text-rose-600',
											dot: 'bg-rose-500',
										},
									];
									const color =
										categoryColors[categoryIndex % categoryColors.length];

									return (
										<div
											key={category}
											className="border-b border-zinc-100 last:border-b-0"
										>
											<button
												onClick={() =>
													setExpandedCategory(isExpanded ? '' : category)
												}
												className={`flex w-full items-center justify-between px-6 py-4 text-left transition-colors ${isExpanded ? color.light : 'hover:bg-zinc-50/80'}`}
											>
												<div className="flex items-center gap-3">
													<div
														className={`h-2.5 w-2.5 rounded-full ${color.dot}`}
													/>
													<span
														className={`text-sm font-semibold ${isExpanded ? color.text : 'text-zinc-700'}`}
													>
														{category}
													</span>
													<span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-400">
														{categorySections.length}
													</span>
												</div>
												<ChevronDown
													className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
												/>
											</button>
											<AnimatePresence>
												{isExpanded && (
													<motion.div
														initial={{ height: 0, opacity: 0 }}
														animate={{ height: 'auto', opacity: 1 }}
														exit={{ height: 0, opacity: 0 }}
														transition={{ duration: 0.2 }}
														className="overflow-hidden"
													>
														<div className="grid grid-cols-2 gap-2 px-6 pt-1 pb-4">
															{categorySections.map(
																([type, config]) => (
																	<button
																		key={type}
																		onClick={() =>
																			addSection(type)
																		}
																		className={`group flex items-start gap-3 rounded-xl border p-3 ${color.border} bg-white text-left transition-all hover:shadow-md`}
																	>
																		<div
																			className={`h-9 w-9 rounded-lg ${color.bg} flex flex-shrink-0 items-center justify-center shadow-sm`}
																		>
																			<config.icon className="h-4 w-4 text-white" />
																		</div>
																		<div className="min-w-0 flex-1">
																			<span className="block text-sm font-medium text-zinc-800">
																				{config.label}
																			</span>
																			<span className="line-clamp-1 text-[11px] leading-tight text-zinc-400">
																				{config.description}
																			</span>
																		</div>
																	</button>
																),
															)}
														</div>
													</motion.div>
												)}
											</AnimatePresence>
										</div>
									);
								})}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
			<ConnectionsModal
				websiteId={websiteId}
				isOpen={connectionsOpen}
				onClose={() => setConnectionsOpen(false)}
			/>
		</div>
	);
}
