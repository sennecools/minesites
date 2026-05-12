// WR-02 / D-20: shared auth+user-presence helper for /api/* route handlers.
//
// The auth() call alone is insufficient because NextAuth can return a
// valid-looking session whose linked User row has been deleted. Callers must
// confirm the User still exists before any write that uses session.user.id as
// a foreign key. This helper centralizes that pattern and returns either the
// session+user pair or a ready-to-return NextResponse.
//
// Usage:
//   const ctx = await requireUser({ requireUserRow: true });
//   if ("response" in ctx) return ctx.response;
//   const { session, userId } = ctx;
//
// The discriminated union keeps the caller's type-narrowing clean and avoids
// having every route re-implement the 401 boilerplate.

import type { Session } from 'next-auth';

import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export interface RequireUserOk {
	session: Session;
	userId: string;
}

export interface RequireUserError {
	response: NextResponse;
}

export type RequireUserResult = RequireUserOk | RequireUserError;

interface RequireUserOptions {
	/**
	 * When true (default), also confirms `db.user.findUnique` returns a row.
	 * This is D-20: the session is valid but the User has been deleted.
	 * Set false on read-only endpoints where a stale session at most leaks
	 * data the user previously owned.
	 */
	requireUserRow?: boolean;
}

export async function requireUser(options: RequireUserOptions = {}): Promise<RequireUserResult> {
	const { requireUserRow = true } = options;

	const session = await auth();
	if (!session?.user?.id) {
		return {
			response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
		};
	}

	if (requireUserRow) {
		const user = await db.user.findUnique({
			where: { id: session.user.id },
			select: { id: true },
		});
		if (!user) {
			return {
				response: NextResponse.json(
					{ error: 'Session expired. Please sign out and sign back in.' },
					{ status: 401 },
				),
			};
		}
	}

	return { session, userId: session.user.id };
}
