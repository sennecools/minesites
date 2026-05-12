import { cache } from 'react';

import { Bebas_Neue, Cinzel, Exo_2, Orbitron, Rajdhani } from 'next/font/google';

import { SiteNav } from '@/components/site/nav';
import { db } from '@/lib/db';
import { FONT_FAMILY_MAP, THEME_PRESETS } from '@/lib/theme-presets';
import { DEFAULT_THEME, type SiteTheme } from '@/types/site-theme';

// All 5 fonts declared at module top-level — Next.js build requirement.
// Each uses the `variable` option so its CSS var is available on the element.
// All 5 font classNames are applied simultaneously; active font is switched
// by setting --site-font-display, not by removing classes (D-07).

const rajdhani = Rajdhani({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-rajdhani',
	display: 'swap',
});

const orbitron = Orbitron({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-orbitron',
	display: 'swap',
});

const cinzel = Cinzel({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-cinzel',
	display: 'swap',
});

const exo2 = Exo_2({
	subsets: ['latin'], // variable font — no weight param needed
	variable: '--font-exo2',
	display: 'swap',
});

const bebasNeue = Bebas_Neue({
	weight: '400', // Only weight available for this font
	subsets: ['latin'],
	variable: '--font-bebas',
	display: 'swap',
});

// Deduplicate the DB call with page.tsx's own server row fetch within a single
// request render pass — one SQL query executes per page load (React.cache dedup).
const getServerData = cache((subdomain: string) =>
	db.website.findUnique({
		where: { subdomain },
		select: { theme: true, name: true },
	}),
);

export default async function SubdomainLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ subdomain: string }>;
}) {
	const { subdomain } = await params;
	const server = await getServerData(subdomain);

	const theme = (server?.theme as SiteTheme | null) ?? DEFAULT_THEME;
	const palette = theme.palette ?? DEFAULT_THEME.palette;
	const font = theme.font ?? DEFAULT_THEME.font;

	// T-02-04: validate palette key before lookup — prevents unknown key from
	// producing `undefined` as a CSS var value.
	const accent = THEME_PRESETS[palette] ?? THEME_PRESETS[DEFAULT_THEME.palette];
	const fontFamily = FONT_FAMILY_MAP[font] ?? FONT_FAMILY_MAP[DEFAULT_THEME.font];

	const serverName = server?.name ?? subdomain;

	// Apply all 5 font variable classNames so CSS vars cascade under .site-root.
	const fontClasses = [
		rajdhani.variable,
		orbitron.variable,
		cinzel.variable,
		exo2.variable,
		bebasNeue.variable,
	].join(' ');

	// CSS vars injected as inline style — server-rendered, present in initial
	// HTML response, no FOUC (D-14, THEME-04).
	// backgroundColor is handled by .site-root in globals.css (CR-03).
	const cssVars: React.CSSProperties = {
		'--site-accent': accent,
		'--site-bg': '#0e0e10',
		'--site-card': '#1a1a1f',
		'--site-text': '#f4f4f5',
		'--site-text-muted': '#a1a1aa',
		'--site-font-display': fontFamily,
	} as React.CSSProperties;

	return (
		<div className={`site-root ${fontClasses}`} data-theme={palette} style={cssVars}>
			<SiteNav serverName={serverName} />
			{children}
		</div>
	);
}
