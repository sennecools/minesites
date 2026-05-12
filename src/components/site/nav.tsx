'use client';

interface SiteNavProps {
	serverName: string;
}

export function SiteNav({ serverName }: SiteNavProps) {
	return (
		<nav
			className="sticky top-0 z-50 flex h-14 items-center justify-between px-6"
			style={{ backgroundColor: 'var(--site-card)' }}
		>
			<span
				className="text-lg font-bold"
				style={{
					fontFamily: 'var(--site-font-display)',
					color: 'var(--site-text)',
				}}
			>
				{serverName}
			</span>
		</nav>
	);
}
