'use client';

import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

import type { HeroSettings as HeroSettingsType, SectionSettingsProps } from '@/types/sections';

/**
 * HeroSettings — extracted from page.tsx SettingsPanel hero block (Phase 1).
 * All onUpdate calls use the nested settings.hero pattern matching the on-disk shape.
 * Background controls are inlined directly (the background panel component stays in page.tsx, out of Phase 1 scope).
 *
 * Per Phase 1 decisions D-04 (Hero only) and D-08 (Section/ServerData from preview/types).
 */
export function HeroSettings({ section, onUpdate }: SectionSettingsProps) {
	const hero = (section.settings.hero as HeroSettingsType | undefined) ?? {};

	const updateHero = (patch: Partial<HeroSettingsType>) => {
		onUpdate({
			settings: {
				...section.settings,
				hero: {
					...hero,
					...patch,
				},
			},
		});
	};

	// Section-level background override (THEME-03) — separate from hero.backgroundColor
	const sectionBg = section.settings.backgroundColor as string | undefined;

	const handleSectionBgChange = (value: string | undefined) => {
		onUpdate({
			settings: {
				...section.settings,
				backgroundColor: value,
			},
		});
	};

	return (
		<>
			{/* Subtitle */}
			<div>
				<label className="settings-label">Subtitle</label>
				<input
					type="text"
					placeholder="Enter subtitle..."
					value={section.subtitle || ''}
					onChange={(e) => onUpdate({ subtitle: e.target.value })}
					className="input-field mt-2"
				/>
			</div>

			{/* Alignment */}
			<div>
				<label className="settings-label">Alignment</label>
				<div className="mt-2 flex gap-2">
					{[
						{ value: 'left' as const, icon: AlignLeft },
						{ value: 'center' as const, icon: AlignCenter },
						{ value: 'right' as const, icon: AlignRight },
					].map(({ value, icon: Icon }) => (
						<button
							key={value}
							type="button"
							onClick={() => updateHero({ alignment: value })}
							className={`flex-1 rounded-lg border p-2 transition-all ${
								(hero.alignment ?? 'center') === value
									? 'border-cyan-300 bg-cyan-50 text-cyan-600'
									: 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300'
							}`}
						>
							<Icon className="mx-auto h-4 w-4" />
						</button>
					))}
				</div>
			</div>

			{/* Background (background controls inlined directly) */}
			<div className="space-y-3 rounded-lg bg-zinc-50/50 p-3">
				<h3 className="text-xs font-semibold tracking-wider text-zinc-700 uppercase">
					Background
				</h3>

				{/* Background Type */}
				<div className="grid grid-cols-3 gap-2">
					{(['solid', 'gradient', 'image'] as const).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => updateHero({ backgroundType: t })}
							className={`rounded-lg border p-2 text-xs transition-all ${
								(hero.backgroundType ?? 'gradient') === t
									? 'border-cyan-300 bg-cyan-50 text-cyan-600'
									: 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
							}`}
						>
							{t[0].toUpperCase() + t.slice(1)}
						</button>
					))}
				</div>

				{/* Solid Color */}
				{(hero.backgroundType ?? 'gradient') === 'solid' && (
					<div>
						<label className="settings-label">Color</label>
						<div className="flex items-center gap-2">
							<div
								className="color-picker"
								style={{ backgroundColor: hero.backgroundColor ?? '#ffffff' }}
							>
								<input
									type="color"
									value={hero.backgroundColor ?? '#ffffff'}
									onChange={(e) =>
										updateHero({ backgroundColor: e.target.value })
									}
									className="absolute inset-0 -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer opacity-0"
								/>
							</div>
							<input
								type="text"
								placeholder="#ffffff"
								value={hero.backgroundColor ?? ''}
								onChange={(e) => updateHero({ backgroundColor: e.target.value })}
								className="input-field min-w-0 flex-1 font-mono text-xs"
							/>
						</div>
					</div>
				)}

				{/* Gradient Colors */}
				{(hero.backgroundType ?? 'gradient') === 'gradient' && (
					<div className="space-y-3">
						<div>
							<label className="settings-label">From</label>
							<div className="flex items-center gap-2">
								<div
									className="color-picker"
									style={{ backgroundColor: hero.gradientFrom ?? '#f0f9ff' }}
								>
									<input
										type="color"
										value={hero.gradientFrom ?? '#f0f9ff'}
										onChange={(e) =>
											updateHero({ gradientFrom: e.target.value })
										}
										className="absolute inset-0 -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer opacity-0"
									/>
								</div>
								<input
									type="text"
									placeholder="#f0f9ff"
									value={hero.gradientFrom ?? ''}
									onChange={(e) => updateHero({ gradientFrom: e.target.value })}
									className="input-field min-w-0 flex-1 font-mono text-xs"
								/>
							</div>
						</div>
						<div>
							<label className="settings-label">To</label>
							<div className="flex items-center gap-2">
								<div
									className="color-picker"
									style={{ backgroundColor: hero.gradientTo ?? '#ecfdf5' }}
								>
									<input
										type="color"
										value={hero.gradientTo ?? '#ecfdf5'}
										onChange={(e) => updateHero({ gradientTo: e.target.value })}
										className="absolute inset-0 -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer opacity-0"
									/>
								</div>
								<input
									type="text"
									placeholder="#ecfdf5"
									value={hero.gradientTo ?? ''}
									onChange={(e) => updateHero({ gradientTo: e.target.value })}
									className="input-field min-w-0 flex-1 font-mono text-xs"
								/>
							</div>
						</div>
					</div>
				)}

				{/* Image Background */}
				{(hero.backgroundType ?? 'gradient') === 'image' && (
					<div className="space-y-3">
						<div>
							<label className="settings-label">Image URL</label>
							<input
								type="text"
								placeholder="https://..."
								value={hero.backgroundImage ?? ''}
								onChange={(e) => updateHero({ backgroundImage: e.target.value })}
								className="input-field"
							/>
						</div>
						<div>
							<label className="settings-label">Blur ({hero.imageBlur ?? 0}px)</label>
							<input
								type="range"
								min="0"
								max="20"
								value={hero.imageBlur ?? 0}
								onChange={(e) =>
									updateHero({ imageBlur: parseInt(e.target.value, 10) })
								}
								className="w-full accent-cyan-500"
							/>
						</div>
						<div>
							<label className="settings-label">
								Darken ({hero.imageDarken ?? 40}%)
							</label>
							<input
								type="range"
								min="0"
								max="100"
								value={hero.imageDarken ?? 40}
								onChange={(e) =>
									updateHero({ imageDarken: parseInt(e.target.value, 10) })
								}
								className="w-full accent-cyan-500"
							/>
						</div>
					</div>
				)}
			</div>

			{/* Player Badge Group */}
			<div className="space-y-3 rounded-lg bg-zinc-50/50 p-3">
				<h3 className="text-xs font-semibold tracking-wider text-zinc-700 uppercase">
					Player Badge
				</h3>

				{/* Position */}
				<div className="grid grid-cols-3 gap-2">
					{(['top', 'bottom', 'hidden'] as const).map((pos) => (
						<button
							key={pos}
							type="button"
							onClick={() => updateHero({ playerBadge: pos })}
							className={`rounded-lg border p-2 text-xs transition-all ${
								(hero.playerBadge ?? 'top') === pos
									? 'border-cyan-300 bg-cyan-50 text-cyan-600'
									: 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
							}`}
						>
							{pos[0].toUpperCase() + pos.slice(1)}
						</button>
					))}
				</div>

				{/* Style */}
				{(hero.playerBadge ?? 'top') !== 'hidden' && (
					<div className="grid grid-cols-2 gap-2">
						{(['pill', 'minimal', 'card', 'glow'] as const).map((style) => (
							<button
								key={style}
								type="button"
								onClick={() => updateHero({ badgeStyle: style })}
								className={`rounded-lg border p-2 text-xs transition-all ${
									(hero.badgeStyle ?? 'pill') === style
										? 'border-cyan-300 bg-cyan-50 text-cyan-600'
										: 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
								}`}
							>
								{style[0].toUpperCase() + style.slice(1)}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Buttons Group */}
			<div className="space-y-3 rounded-lg bg-zinc-50/50 p-3">
				<h3 className="text-xs font-semibold tracking-wider text-zinc-700 uppercase">
					Buttons
				</h3>

				{/* Discord Button */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() =>
							updateHero({ showDiscordButton: !(hero.showDiscordButton ?? true) })
						}
						className={`h-5 w-8 flex-shrink-0 rounded-full transition-all ${
							(hero.showDiscordButton ?? true) ? 'bg-cyan-500' : 'bg-zinc-300'
						}`}
					>
						<div
							className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
								(hero.showDiscordButton ?? true)
									? 'translate-x-3.5'
									: 'translate-x-0.5'
							}`}
						/>
					</button>
					<input
						type="text"
						placeholder="Join Discord"
						value={hero.discordButtonText ?? ''}
						onChange={(e) => updateHero({ discordButtonText: e.target.value })}
						disabled={!(hero.showDiscordButton ?? true)}
						className={`input-field min-w-0 flex-1 ${
							!(hero.showDiscordButton ?? true) ? 'opacity-50' : ''
						}`}
					/>
				</div>

				{/* Copy IP Button */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() =>
							updateHero({ showCopyIpButton: !(hero.showCopyIpButton ?? true) })
						}
						className={`h-5 w-8 flex-shrink-0 rounded-full transition-all ${
							(hero.showCopyIpButton ?? true) ? 'bg-cyan-500' : 'bg-zinc-300'
						}`}
					>
						<div
							className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
								(hero.showCopyIpButton ?? true)
									? 'translate-x-3.5'
									: 'translate-x-0.5'
							}`}
						/>
					</button>
					<input
						type="text"
						placeholder="Copy IP"
						value={hero.copyIpButtonText ?? ''}
						onChange={(e) => updateHero({ copyIpButtonText: e.target.value })}
						disabled={!(hero.showCopyIpButton ?? true)}
						className={`input-field min-w-0 flex-1 ${
							!(hero.showCopyIpButton ?? true) ? 'opacity-50' : ''
						}`}
					/>
				</div>
			</div>

			{/* Section Background Override — THEME-03 */}
			<div className="space-y-3 rounded-lg bg-zinc-50/50 p-3">
				<h3 className="settings-label">Section Background</h3>
				<div className="flex items-center gap-2">
					<div
						className="color-picker"
						style={{ backgroundColor: sectionBg ?? '#0e0e10' }}
					>
						<input
							type="color"
							value={sectionBg ?? '#0e0e10'}
							onChange={(e) => handleSectionBgChange(e.target.value)}
							className="absolute inset-0 -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer opacity-0"
						/>
					</div>
					<input
						type="text"
						placeholder="#0e0e10"
						value={sectionBg ?? ''}
						onChange={(e) => handleSectionBgChange(e.target.value || undefined)}
						className="input-field min-w-0 flex-1 font-mono text-xs"
					/>
					{sectionBg && (
						<button
							type="button"
							onClick={() => handleSectionBgChange(undefined)}
							className="text-xs whitespace-nowrap text-zinc-400 transition-colors hover:text-zinc-600"
						>
							Reset Background
						</button>
					)}
				</div>
			</div>
		</>
	);
}
