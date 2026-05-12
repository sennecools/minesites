'use client';

import {
	AlignLeft,
	BarChart3,
	HelpCircle,
	Image as ImageIcon,
	Layout,
	ListChecks,
	MessageCircle,
	ShoppingBag,
	Sparkles,
	Star,
	Trophy,
	Users,
	Video,
	Vote,
} from 'lucide-react';

import type { ComponentType, ElementType } from 'react';

import { HeroRender } from '@/components/sections/render/hero-render';
import { HeroSettings } from '@/components/sections/settings/hero-settings';
import type {
	SectionRenderProps,
	SectionSettings,
	SectionSettingsProps,
	SectionType,
} from '@/types/sections';

/**
 * SECTION_REGISTRY — single source of truth for section type metadata.
 * Per Phase 1 decisions D-01 (rich shape) and D-02 (plain typed Record).
 *
 * Adding a new section type:
 *   1. Add the literal to SectionType in @/types/sections.
 *   2. Create the 2 files (render + settings) under @/components/sections/{render,settings}/.
 *   3. Add ONE entry to SECTION_REGISTRY below.
 * No edits to page.tsx or preview-client.tsx are needed.
 *
 * Phase 1 ships ONLY the Hero entry as real components (decision D-04). All other
 * SectionType members reference PlaceholderRender / PlaceholderSettings stubs so the
 * Record<SectionType, ...> exhaustiveness check is satisfied at compile time.
 */

export interface RegistryEntry {
	type: SectionType;
	render: ComponentType<SectionRenderProps>;
	settings: ComponentType<SectionSettingsProps>;
	defaultSettings: () => SectionSettings;
	displayName: string;
	icon: ElementType; // Component constructor — render as <Entry.icon className="..." />
	category: string; // "Essential" | "Community" | "Media" | "Info" | "Engagement"
	description: string; // One-line description for the section picker
	maxCount?: number;
}

// ---------- Placeholder stubs for non-extracted section types ----------
// These satisfy the Record<SectionType, RegistryEntry> exhaustiveness without forcing
// the registry to ship 14 component files in Phase 1. Per Phase 1 decision D-04
// and RESEARCH §Pattern 2.

function PlaceholderRender({ section }: SectionRenderProps) {
	return (
		<section className="bg-zinc-100 py-16">
			<div className="mx-auto max-w-5xl px-6 text-center">
				<h2 className="mb-2 text-2xl font-bold">{section.title || section.type}</h2>
				<p className="text-sm text-zinc-500">Section type: {section.type}</p>
			</div>
		</section>
	);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PlaceholderSettings(_props: SectionSettingsProps) {
	return null;
}

// ---------- The registry ----------
// `Record<SectionType, RegistryEntry>` enforces ONE entry per literal in SectionType.
// Removing any entry below produces a TypeScript error.

export const SECTION_REGISTRY: Record<SectionType, RegistryEntry> = {
	hero: {
		type: 'hero',
		render: HeroRender,
		settings: HeroSettings,
		defaultSettings: () => ({
			hero: {
				alignment: 'center',
				backgroundType: 'gradient',
				backgroundColor: '#ffffff',
				gradientFrom: '#f0f9ff',
				gradientTo: '#ecfdf5',
				backgroundImage: '',
				imageBlur: 0,
				imageDarken: 40,
				playerBadge: 'top',
				badgeStyle: 'pill',
				showDiscordButton: true,
				discordButtonText: 'Join Discord',
				showCopyIpButton: true,
				copyIpButtonText: 'Copy IP',
			},
		}),
		displayName: 'Hero Section',
		icon: Layout,
		category: 'Essential',
		description: 'Main banner with title and CTA',
	},
	stats: {
		type: 'stats',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Live Player Count',
		icon: BarChart3,
		category: 'Essential',
		description: 'Live player count and info',
		maxCount: 1,
	},
	features: {
		type: 'features',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Features / About',
		icon: Sparkles,
		category: 'Essential',
		description: 'Highlight server features',
	},
	gamemodes: {
		type: 'gamemodes',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Game Modes',
		icon: Trophy,
		category: 'Essential',
		description: 'Showcase your servers',
	},
	discord: {
		type: 'discord',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Discord CTA',
		icon: MessageCircle,
		category: 'Community',
		description: 'Discord widget and invite',
	},
	gallery: {
		type: 'gallery',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Image Gallery',
		icon: ImageIcon,
		category: 'Media',
		description: 'Screenshot showcase',
	},
	staff: {
		type: 'staff',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Staff',
		icon: Users,
		category: 'Community',
		description: 'Show your team members',
	},
	text: {
		type: 'text',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Text',
		icon: AlignLeft,
		category: 'Essential',
		description: 'Custom text content',
	},
	rules: {
		type: 'rules',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Rules',
		icon: ListChecks,
		category: 'Info',
		description: 'List your server rules',
	},
	voting: {
		type: 'voting',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Voting Links',
		icon: Vote,
		category: 'Engagement',
		description: 'Voting sites and rewards',
	},
	store: {
		type: 'store',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Store',
		icon: ShoppingBag,
		category: 'Engagement',
		description: 'Featured store items',
	},
	reviews: {
		type: 'reviews',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Reviews',
		icon: Star,
		category: 'Community',
		description: 'Player testimonials',
	},
	faq: {
		type: 'faq',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'FAQ',
		icon: HelpCircle,
		category: 'Info',
		description: 'Common questions',
	},
	video: {
		type: 'video',
		render: PlaceholderRender,
		settings: PlaceholderSettings,
		defaultSettings: () => ({}),
		displayName: 'Video',
		icon: Video,
		category: 'Media',
		description: 'YouTube trailer embed',
	},
};
