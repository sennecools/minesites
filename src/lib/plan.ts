// Plan-tier limits. Per Phase 1 decisions D-09, D-10.
// Free tier max 5 sections, paid tier max 15 sections.
// The User.plan field is added in Phase 4; in Phase 1 callers pass the literal.

export interface PlanLimits {
	maxSections: number;
}

export function getPlanLimits(plan: 'free' | 'paid'): PlanLimits {
	switch (plan) {
		case 'paid':
			return { maxSections: 15 };
		case 'free':
		default:
			return { maxSections: 5 };
	}
}
