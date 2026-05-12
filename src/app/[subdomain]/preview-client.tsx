'use client';

import {
	BarChart3,
	ChevronRight,
	Globe,
	Heart,
	Image,
	Maximize2,
	MessageCircle,
	Rocket,
	Server,
	Shield,
	Sparkles,
	Star,
	Trophy,
	Users,
	Zap,
} from 'lucide-react';

import {
	isColorDark,
	isLightColor,
	type FeatureItem,
	type GalleryImage,
	type Section,
	type StatsServer,
	type WebsiteData,
} from '@/components/preview/types';
import { SECTION_REGISTRY } from '@/lib/section-registry';
import type { SectionType } from '@/types/sections';

// Icon map
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
];

// Preview Components

function PreviewStats({ section }: { section: Section }) {
	const stats = (section.settings.stats as Record<string, unknown>) || {};
	const {
		mode = 'single',
		servers = [],
		layout = 'grid',
		showTotal = true,
		showVersion = true,
		showUptime = true,
		version = '1.20.4',
		uptime = '99.9%',
		backgroundType = 'solid',
		backgroundColor = '#18181b',
		gradientFrom = '#18181b',
		gradientTo = '#27272a',
		headerAlignment = 'center',
	} = stats;

	const isDark =
		(backgroundType === 'solid' && isColorDark(backgroundColor as string)) ||
		(backgroundType === 'gradient' && isColorDark(gradientFrom as string));

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor: backgroundColor as string };
		if (backgroundType === 'gradient')
			return {
				background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
			};
		return {};
	};

	const displayServers: StatsServer[] =
		(servers as StatsServer[]).length > 0
			? (servers as StatsServer[])
			: [
					{ id: '1', name: 'Survival', players: 45, maxPlayers: 100, status: 'online' },
					{ id: '2', name: 'Skyblock', players: 32, maxPlayers: 50, status: 'online' },
					{ id: '3', name: 'Prison', players: 28, maxPlayers: 75, status: 'online' },
				];

	const totalPlayers = displayServers.reduce((sum, s) => sum + (s.players || 0), 0);
	const totalMaxPlayers = displayServers.reduce((sum, s) => sum + (s.maxPlayers || 0), 0);

	if (mode === 'single') {
		const statItems = [
			{
				value: '247',
				label: 'Players Online',
				icon: Users,
				color: 'text-green-500',
				iconBg: 'bg-green-500/10',
			},
			{
				value: '500',
				label: 'Server Capacity',
				icon: Server,
				color: isDark ? 'text-cyan-400' : 'text-cyan-600',
				iconBg: 'bg-cyan-500/10',
			},
			...(showVersion
				? [
						{
							value: version as string,
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
							value: uptime as string,
							label: 'Uptime',
							icon: BarChart3,
							color: isDark ? 'text-indigo-400' : 'text-indigo-600',
							iconBg: 'bg-indigo-500/10',
						},
					]
				: []),
		];

		return (
			<div className="relative overflow-hidden px-6 py-12" style={getBackgroundStyle()}>
				<div className="relative mx-auto max-w-5xl">
					{section.title && (
						<div
							className={`mb-8 ${headerAlignment === 'center' ? 'text-center' : headerAlignment === 'right' ? 'text-right' : 'text-left'}`}
						>
							<h2
								className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
							>
								{section.title}
							</h2>
						</div>
					)}
					<div
						className={`${layout === 'compact' ? 'flex flex-wrap items-center justify-center gap-12' : 'grid grid-cols-2 gap-6 md:grid-cols-4'}`}
					>
						{statItems.map((stat, i) => (
							<div
								key={i}
								className={`${layout === 'compact' ? 'text-center' : 'cursor-pointer rounded-xl px-4 py-6 text-center transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02]'} ${layout !== 'compact' ? (isDark ? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10' : 'border border-zinc-200 bg-white/80 shadow-sm hover:border-zinc-300 hover:shadow-lg') : ''}`}
							>
								{layout !== 'compact' && (
									<div
										className={`h-14 w-14 rounded-xl ${stat.iconBg} mx-auto mb-4 flex items-center justify-center`}
									>
										<stat.icon className={`h-7 w-7 ${stat.color}`} />
									</div>
								)}
								<div className={`text-3xl font-bold ${stat.color}`}>
									{stat.value}
								</div>
								<div
									className={`mt-1 text-sm font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
								>
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="relative overflow-hidden px-6 py-12" style={getBackgroundStyle()}>
			<div className="relative mx-auto max-w-5xl">
				<div
					className={`mb-8 ${headerAlignment === 'center' ? 'text-center' : headerAlignment === 'right' ? 'text-right' : 'text-left'}`}
				>
					{section.title && (
						<h2
							className={`mb-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
						>
							{section.title}
						</h2>
					)}
					{!!showTotal && (
						<div
							className={`flex items-center gap-2 ${headerAlignment === 'center' ? 'justify-center' : headerAlignment === 'right' ? 'justify-end' : 'justify-start'}`}
						>
							<span className="text-4xl font-bold text-green-500">
								{totalPlayers}
							</span>
							<span
								className={`text-xl ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
							>
								/ {totalMaxPlayers} players online
							</span>
						</div>
					)}
				</div>
				<div
					className={`${layout === 'list' ? 'mx-auto max-w-2xl space-y-3' : 'grid grid-cols-1 gap-4 md:grid-cols-3'}`}
				>
					{displayServers.map((server) => (
						<div
							key={server.id}
							className={`${layout === 'list' ? 'flex items-center justify-between px-5 py-4 hover:scale-[1.01]' : 'p-5 hover:-translate-y-1 hover:scale-[1.02]'} cursor-pointer rounded-xl transition-all duration-200 ${isDark ? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10' : 'border border-zinc-200 bg-white/80 shadow-sm hover:border-zinc-300 hover:shadow-lg'}`}
						>
							<div className="flex items-center gap-3">
								<div
									className={`h-3 w-3 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}
								/>
								<span
									className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}
								>
									{server.name}
								</span>
							</div>
							<div className={layout === 'list' ? 'flex items-center gap-4' : 'mt-3'}>
								<div className={layout === 'list' ? '' : 'mb-3'}>
									<span className="text-2xl font-bold text-green-500">
										{server.players || 0}
									</span>
									<span
										className={`text-lg ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
									>
										{' '}
										/ {server.maxPlayers || 0}
									</span>
								</div>
								<div
									className={`${layout === 'list' ? 'w-24' : 'w-full'} h-2 overflow-hidden rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}
								>
									<div
										className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
										style={{
											width: `${((server.players || 0) / (server.maxPlayers || 1)) * 100}%`,
										}}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function PreviewFeatures({ section }: { section: Section }) {
	const rawFeatures = (section.settings.content as Record<string, unknown>)?.features;
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

	const featuresSettings = (section.settings.features as Record<string, unknown>) || {};
	const {
		layout = '2x2',
		headerAlignment = 'center',
		cardAlignment = 'left',
		backgroundType = 'gradient',
		backgroundColor = '#ffffff',
		gradientFrom = '#ffffff',
		gradientTo = '#f4f4f5',
	} = featuresSettings;

	const isDark =
		(backgroundType === 'solid' && isColorDark(backgroundColor as string)) ||
		(backgroundType === 'gradient' && isColorDark(gradientFrom as string));
	const featureCount = layout === '2x1' ? 2 : 4;

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor: backgroundColor as string };
		if (backgroundType === 'gradient')
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		return {};
	};

	return (
		<div className="relative overflow-hidden px-6 py-16" style={getBackgroundStyle()}>
			<div className="relative mx-auto max-w-5xl">
				<div
					className={`mb-12 ${headerAlignment === 'center' ? 'text-center' : headerAlignment === 'right' ? 'text-right' : 'text-left'}`}
				>
					<h2
						className={`mb-3 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Why Join Us?'}
					</h2>
					{section.subtitle && (
						<p
							className={`max-w-2xl text-lg ${headerAlignment === 'center' ? 'mx-auto' : headerAlignment === 'right' ? 'ml-auto' : ''} ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
						>
							{section.subtitle}
						</p>
					)}
				</div>
				<div className="grid gap-6 md:grid-cols-2">
					{features.slice(0, featureCount).map((feature, i) => {
						const Icon = featureIcons[feature.icon] || Zap;
						const gradient = iconGradients[i % iconGradients.length];
						return (
							<div
								key={i}
								className={`feature-card flex cursor-pointer flex-col rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 ${cardAlignment === 'center' ? 'items-center text-center' : cardAlignment === 'right' ? 'items-end text-right' : 'items-start text-left'} ${isDark ? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10' : 'border border-zinc-200 bg-white/80 shadow-sm hover:border-zinc-300 hover:shadow-lg'}`}
							>
								<div
									className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} icon-wiggle mb-4 flex items-center justify-center shadow-lg`}
								>
									<Icon className="h-7 w-7 text-white" />
								</div>
								<h3
									className={`mb-2 text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
								>
									{feature.title}
								</h3>
								{feature.description && (
									<p
										className={`text-base ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
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
	const modes = ((section.settings.content as Record<string, unknown>)?.modes as string[]) || [
		'Survival',
		'Skyblock',
		'Prison',
		'KitPvP',
	];
	const gamemodesSettings = (section.settings.gamemodes as Record<string, unknown>) || {};
	const {
		layout = 'grid-2x2',
		backgroundType = 'solid',
		backgroundColor = '#fafafa',
		gradientFrom = '#fafafa',
		gradientTo = '#f4f4f5',
		showPlayerCount = true,
		showBadge = true,
		showModpack = true,
		showDescription = true,
		headerAlignment = 'center',
	} = gamemodesSettings;

	const isDark =
		(backgroundType === 'solid' && isColorDark(backgroundColor as string)) ||
		(backgroundType === 'gradient' && isColorDark(gradientFrom as string));

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor: backgroundColor as string };
		if (backgroundType === 'gradient')
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		return {};
	};

	const serverData = [
		{
			modpack: 'ATM10',
			desc: 'Endless tech, magic, and chaos.',
			players: 4,
			isPopular: true,
			gradient: 'from-emerald-400 via-cyan-500 to-blue-600',
			bannerPattern: true,
		},
		{
			modpack: 'MoniFactory',
			desc: 'Factory-focused modpack.',
			players: 0,
			isClosed: true,
			gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
			bannerPattern: false,
		},
		{
			modpack: 'Custom Pack',
			desc: 'Our curated experience.',
			players: 12,
			gradient: 'from-amber-400 via-orange-500 to-red-500',
			bannerPattern: true,
		},
		{
			modpack: 'Vanilla+',
			desc: 'Enhanced vanilla.',
			players: 8,
			gradient: 'from-rose-400 via-pink-500 to-purple-500',
			bannerPattern: false,
		},
	];

	const displayModes = layout === 'single' ? modes.slice(0, 1) : modes.slice(0, 4);

	const gridClass =
		layout === 'single'
			? 'max-w-2xl mx-auto'
			: layout === 'grid-4'
				? 'grid grid-cols-2 lg:grid-cols-4 gap-4'
				: layout === 'list'
					? 'flex flex-col gap-3'
					: 'grid md:grid-cols-2 gap-5';

	return (
		<div className="relative overflow-hidden px-6 py-16" style={getBackgroundStyle()}>
			<div className="relative mx-auto max-w-5xl">
				<div
					className={`mb-10 ${headerAlignment === 'center' ? 'text-center' : headerAlignment === 'right' ? 'text-right' : 'text-left'}`}
				>
					<h2
						className={`mb-2 text-3xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
					>
						{section.title || 'Active Servers'}
					</h2>
					{section.subtitle && (
						<p className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>
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
									className={`group cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] ${isDark ? 'border border-white/10 bg-white/5 hover:border-white/20' : 'border border-zinc-200 bg-white shadow-md hover:border-zinc-300 hover:shadow-xl'}`}
								>
									<div
										className={`relative aspect-[2.5/1] bg-gradient-to-br ${data.gradient}`}
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
										{!!showBadge && data.isPopular && (
											<span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
												<Star className="h-4 w-4 fill-current" /> Popular
											</span>
										)}
										{!!showPlayerCount && !data.isClosed && (
											<div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-sm">
												<span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
												<span className="font-medium text-white">
													{data.players} online
												</span>
											</div>
										)}
									</div>
									<div className="p-6">
										<h3
											className={`text-2xl font-bold transition-colors group-hover:text-indigo-600 ${isDark ? 'text-white' : 'text-zinc-900'}`}
										>
											{mode}
										</h3>
										{!!showModpack && (
											<p
												className={`text-base ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
											>
												{data.modpack}
											</p>
										)}
										{!!showDescription && (
											<p
												className={`mt-3 mb-5 text-base ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
											>
												{data.desc}
											</p>
										)}
										<button
											className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-cyan-200/50'}`}
										>
											Join Server <ChevronRight className="h-4 w-4" />
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
									className={`group flex cursor-pointer items-center gap-4 rounded-xl p-3 transition-all duration-200 hover:scale-[1.01] ${isDark ? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10' : 'border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow-lg'}`}
								>
									<div
										className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${data.gradient}`}
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
									</div>
									<div className="min-w-0 flex-1">
										<h3
											className={`truncate font-bold transition-colors group-hover:text-indigo-600 ${isDark ? 'text-white' : 'text-zinc-900'}`}
										>
											{mode}
										</h3>
										{!!showModpack && (
											<p
												className={`truncate text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
											>
												{data.modpack}
											</p>
										)}
									</div>
									{!!showPlayerCount && !data.isClosed && (
										<div className="flex items-center gap-1.5 text-sm">
											<span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
											<span
												className={
													isDark ? 'text-zinc-400' : 'text-zinc-500'
												}
											>
												{data.players}
											</span>
										</div>
									)}
									{!!showBadge && data.isClosed && (
										<span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
											Closed
										</span>
									)}
									<button
										className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'}`}
									>
										Join <ChevronRight className="inline h-3 w-3" />
									</button>
								</div>
							);
						}

						// Default grid layouts (grid-2x2 and grid-4)
						return (
							<div
								key={i}
								className={`group cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] ${isDark ? 'border border-white/10 bg-white/5 hover:border-white/20' : 'border border-zinc-200 bg-white shadow-md hover:border-zinc-300 hover:shadow-xl'}`}
							>
								<div
									className={`relative ${layout === 'grid-4' ? 'aspect-[2.5/1]' : 'aspect-[2/1]'} bg-gradient-to-br ${data.gradient}`}
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
									{!!showBadge && data.isPopular && (
										<span
											className={`absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-indigo-600 font-bold text-white shadow-lg ${layout === 'grid-4' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
										>
											<Star
												className={`${layout === 'grid-4' ? 'h-2.5 w-2.5' : 'h-3 w-3'} fill-current`}
											/>{' '}
											Popular
										</span>
									)}
									{!!showBadge && data.isClosed && (
										<span
											className={`absolute top-2 right-2 rounded-lg bg-red-600 font-bold text-white ${layout === 'grid-4' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}
										>
											Closed
										</span>
									)}
									{!!showPlayerCount && !data.isClosed && (
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
								</div>
								<div className={layout === 'grid-4' ? 'p-3' : 'p-4'}>
									<h3
										className={`${layout === 'grid-4' ? 'text-sm' : 'text-lg'} font-bold transition-colors group-hover:text-indigo-600 ${isDark ? 'text-white' : 'text-zinc-900'}`}
									>
										{mode}
									</h3>
									{!!showModpack && (
										<p
											className={`${layout === 'grid-4' ? 'text-xs' : 'text-sm'} ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}
										>
											{data.modpack}
										</p>
									)}
									<button
										className={`mt-3 flex w-full items-center justify-center gap-1 rounded-xl font-medium transition-all ${layout === 'grid-4' ? 'px-2 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'} ${isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-cyan-200/50'}`}
									>
										Join{' '}
										<ChevronRight
											className={layout === 'grid-4' ? 'h-3 w-3' : 'h-4 w-4'}
										/>
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function PreviewDiscord({ section, serverData }: { section: Section; serverData: WebsiteData }) {
	const discordSettings = (section.settings.discord as Record<string, unknown>) || {};
	const {
		layout = 'default',
		alignment = 'left',
		backgroundType = 'gradient',
		backgroundColor = '#eef2ff',
		gradientFrom = '#eef2ff',
		gradientTo = '#faf5ff',
		showBadge = true,
		showStats = true,
		memberCount,
		onlineCount,
		buttonText = 'Join Server',
		guildName,
		guildIcon,
	} = discordSettings;

	const isDark = backgroundType === 'solid' && isColorDark(backgroundColor as string);
	const formatCount = (count?: unknown) => {
		if (!count) return '—';
		const num = count as number;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
		return num.toString();
	};

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor: backgroundColor as string };
		if (backgroundType === 'gradient')
			return {
				background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientTo})`,
			};
		return {};
	};

	const DiscordCard = () => (
		<div className="w-full max-w-sm overflow-hidden rounded-2xl bg-[#2b2d31] shadow-2xl">
			<div className="relative h-24 bg-gradient-to-br from-indigo-500 to-purple-600">
				<div className="absolute -bottom-6 left-4">
					{guildIcon ? (
						<img
							src={guildIcon as string}
							alt=""
							className="h-14 w-14 rounded-2xl border-4 border-[#2b2d31] object-cover"
						/>
					) : (
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-[#2b2d31] bg-gradient-to-br from-emerald-400 to-cyan-500">
							<span className="text-lg font-bold text-white">
								{((guildName as string) || serverData.name).charAt(0)}
							</span>
						</div>
					)}
				</div>
			</div>
			<div className="px-4 pt-8 pb-4">
				<h3 className="text-lg font-bold text-white">
					{(guildName as string) || serverData.name}
				</h3>
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
					{buttonText as string}
				</button>
			</div>
		</div>
	);

	if (layout === 'compact') {
		return (
			<div className="relative overflow-hidden px-6 py-10" style={getBackgroundStyle()}>
				<div className="relative mx-auto max-w-4xl">
					<div className="flex flex-col items-center justify-between gap-6 md:flex-row">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
								<MessageCircle className="h-6 w-6 text-white" />
							</div>
							<div>
								<h2
									className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
								>
									{section.title || 'Join Our Discord'}
								</h2>
								{!!showStats && !!(memberCount || onlineCount) && (
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
							{buttonText as string}
						</button>
					</div>
				</div>
			</div>
		);
	}

	const textAlignClass =
		alignment === 'center'
			? 'text-center md:text-center'
			: alignment === 'right'
				? 'text-center md:text-right'
				: 'text-center md:text-left';
	const justifyClass =
		alignment === 'center'
			? 'justify-center md:justify-center'
			: alignment === 'right'
				? 'justify-center md:justify-end'
				: 'justify-center md:justify-start';
	const flexDirection = layout === 'card-left' ? 'md:flex-row-reverse' : 'md:flex-row';

	return (
		<div className="relative overflow-hidden px-6 py-16" style={getBackgroundStyle()}>
			<div className="relative mx-auto max-w-5xl">
				<div className={`flex flex-col ${flexDirection} items-center gap-10`}>
					<div className={`flex-1 ${textAlignClass}`}>
						{!!showBadge && (
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
								className={`mb-6 text-lg ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}
							>
								{section.subtitle}
							</p>
						)}
						{!!showStats && !!(memberCount || onlineCount) && (
							<div className={`flex items-center gap-6 ${justifyClass}`}>
								<div>
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
								<div>
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
					<DiscordCard />
				</div>
			</div>
		</div>
	);
}

function PreviewGallery({ section }: { section: Section }) {
	const gallerySettings = (section.settings.gallery as Record<string, unknown>) || {};
	const {
		layout = 'bento',
		columns = 3,
		images = [],
		showLabels = true,
		backgroundType = 'solid',
		backgroundColor = '#ffffff',
		gradientFrom = '#ffffff',
		gradientTo = '#f4f4f5',
		headerAlignment = 'center',
	} = gallerySettings;

	const isDark =
		(backgroundType === 'solid' && isColorDark(backgroundColor as string)) ||
		(backgroundType === 'gradient' && isColorDark(gradientFrom as string));

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor: backgroundColor as string };
		if (backgroundType === 'gradient')
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		return {};
	};

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
	const displayImages =
		(images as GalleryImage[]).length > 0 ? (images as GalleryImage[]) : placeholderImages;

	const renderImageCard = (img: GalleryImage, index: number, extraClasses = '') => {
		const isPlaceholder = !img.url;
		const gradient = placeholderGradients[index % placeholderGradients.length];

		return (
			<div
				key={img.id}
				className={`group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${extraClasses}`}
			>
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
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
				{!!showLabels && img.label && (
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
				<div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
					<Maximize2 className="h-4 w-4 text-white" />
				</div>
			</div>
		);
	};

	const colsClass =
		columns === 2
			? 'columns-2'
			: columns === 4
				? 'columns-2 md:columns-4'
				: 'columns-2 md:columns-3';

	return (
		<div className="relative overflow-hidden px-6 py-16" style={getBackgroundStyle()}>
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
						<p className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>
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
						className={`grid gap-3 ${columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}
					>
						{displayImages.map((img, i) => renderImageCard(img, i, 'aspect-video'))}
					</div>
				)}

				{/* Masonry layout - alternating heights */}
				{layout === 'masonry' && (
					<div className={`${colsClass} gap-3 space-y-3`}>
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
			</div>
		</div>
	);
}

interface StaffMember {
	username: string;
	role: string;
	roleColor: string;
}

function PreviewStaff({ section }: { section: Section }) {
	const staffSettings = (section.settings.staff as Record<string, unknown>) || {};
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
		(backgroundType === 'solid' && isColorDark(backgroundColor as string)) ||
		(backgroundType === 'gradient' && isColorDark(gradientFrom as string));

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor: backgroundColor as string };
		if (backgroundType === 'gradient')
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		return {};
	};

	const alignmentClass =
		headerAlignment === 'left'
			? 'text-left'
			: headerAlignment === 'right'
				? 'text-right'
				: 'text-center';

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

	const defaultStaff: StaffMember[] = [
		{ username: 'Notch', role: 'Owner', roleColor: 'red' },
		{ username: 'jeb_', role: 'Admin', roleColor: 'indigo' },
		{ username: 'Dinnerbone', role: 'Moderator', roleColor: 'emerald' },
		{ username: 'MHF_Steve', role: 'Helper', roleColor: 'cyan' },
	];

	const displayStaff =
		(members as StaffMember[]).length > 0 ? (members as StaffMember[]) : defaultStaff;

	const gridClass =
		layout === 'list'
			? 'flex flex-col gap-3 max-w-2xl mx-auto'
			: layout === 'compact'
				? 'flex flex-wrap justify-center gap-6'
				: 'grid grid-cols-2 sm:grid-cols-4 gap-5';

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

						if (layout === 'list') {
							return (
								<div
									key={member.username}
									className={`group flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] ${isDark ? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10' : 'border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow-lg'}`}
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

						return (
							<div
								key={member.username}
								className={`group cursor-pointer rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] ${isDark ? 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10' : 'border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 hover:shadow-xl'}`}
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
	const textSettings = (section.settings.text as Record<string, unknown>) || {};
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
	} = textSettings;

	const hasImage = backgroundType === 'image' && !!backgroundImage;
	const isDark =
		hasImage ||
		(backgroundType === 'solid' && isColorDark(backgroundColor as string)) ||
		(backgroundType === 'gradient' && isColorDark(gradientFrom as string));

	const getBackgroundStyle = () => {
		if (backgroundType === 'solid') return { backgroundColor: backgroundColor as string };
		if (backgroundType === 'gradient')
			return { background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})` };
		return {};
	};

	const alignmentClass =
		alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';
	const sizeClass = size === 'small' ? 'text-sm' : size === 'large' ? 'text-lg' : 'text-base';

	const displayContent =
		(content as string) || section.subtitle || 'Add your custom text content here.';

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
						style={{ opacity: (imageDarken as number) / 100 }}
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

// Main Preview Component
interface PreviewClientProps {
	server: WebsiteData;
	sections: Section[];
	isPreviewMode: boolean;
}

export default function PreviewClient({ server, sections, isPreviewMode }: PreviewClientProps) {
	return (
		<div className="min-h-screen bg-zinc-50">
			{isPreviewMode && (
				<div className="bg-amber-500 py-2 text-center text-sm font-medium text-white">
					Preview Mode - This site is not published yet
				</div>
			)}
			{sections.map((section) => {
				if (!section.visible) return null;

				const entry = SECTION_REGISTRY[section.type as SectionType];
				if (!entry) {
					return (
						<section key={section.id} className="bg-zinc-100 py-16">
							<div className="mx-auto max-w-5xl px-6 text-center">
								<h2 className="mb-2 text-2xl font-bold">
									{section.title || section.type}
								</h2>
								<p className="text-zinc-500">Section type: {section.type}</p>
							</div>
						</section>
					);
				}
				return <entry.render key={section.id} section={section} serverData={server} />;
			})}
		</div>
	);
}
