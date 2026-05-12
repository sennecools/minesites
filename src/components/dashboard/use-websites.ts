'use client';

import { useCallback, useEffect, useState } from 'react';

import type { WebsiteCardData } from './website-card';

interface UseWebsitesResult {
	websites: WebsiteCardData[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

/**
 * Shared loader for the dashboard list pages (WR-04).
 *
 * Both `/dashboard` and `/dashboard/servers` call `GET /api/websites`,
 * manage the same `(servers, isLoading, error)` triple, and previously
 * inlined identical fetch loops. Consolidating here removes ~50 lines of
 * duplicated UI plumbing and lets `Retry` (WR-05) re-invoke the loader
 * instead of forcing a full page reload — sidebar state, the dialog
 * `open` flag, and any other client state survive a failure-and-retry.
 *
 * A future SWR / TanStack Query migration becomes a one-file change.
 */
export function useWebsites(): UseWebsitesResult {
	const [websites, setWebsites] = useState<WebsiteCardData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// `cancelledRef`-style guard via the effect closure: each call captures its
	// own `cancelled` flag so a Retry click during an in-flight fetch can't race
	// a stale response into state.
	const load = useCallback(async (signal?: AbortSignal) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/websites', { signal });
			if (!response.ok) {
				throw new Error('Failed to load servers');
			}
			const data: WebsiteCardData[] = await response.json();
			if (!signal?.aborted) setWebsites(data);
		} catch (err) {
			if (signal?.aborted) return;
			// AbortError surfaces as a DOMException with name === "AbortError". The
			// `signal?.aborted` early-return above already covers the manual abort
			// path, but the fetch may reject with an AbortError before the signal
			// flag flips — swallow it explicitly so it doesn't render as a user-
			// visible error.
			if (err instanceof DOMException && err.name === 'AbortError') return;
			setError(err instanceof Error ? err.message : 'Failed to load servers');
		} finally {
			if (!signal?.aborted) setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		load(controller.signal);
		return () => controller.abort();
	}, [load]);

	// refetch is the WR-05 hook: replaces window.location.reload() with a
	// targeted re-fetch that preserves the surrounding React tree (sidebar,
	// dialogs, etc.). No signal here — a manual refetch always overwrites the
	// visible state.
	const refetch = useCallback(() => {
		void load();
	}, [load]);

	return { websites, isLoading, error, refetch };
}
