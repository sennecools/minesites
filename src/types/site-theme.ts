// SiteTheme — Phase 2 Theme System schema per D-06.
// Replaces the Phase 1 stub (5 optional generic fields).

export type PaletteKey =
	| 'cyan'
	| 'emerald'
	| 'violet'
	| 'orange'
	| 'red'
	| 'gold'
	| 'pink'
	| 'white';

export type FontKey = 'rajdhani' | 'orbitron' | 'cinzel' | 'exo2' | 'bebas';

export interface SiteTheme {
	palette: PaletteKey;
	font: FontKey;
}

export const DEFAULT_THEME: SiteTheme = {
	palette: 'cyan',
	font: 'rajdhani',
};
