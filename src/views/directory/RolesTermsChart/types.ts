/**
 * The chart proxy is self-seeded from bundled fixtures (like MeetingList), so
 * it takes no props today. The interface + factory are kept for parity with the
 * other views and to give consumers a typed extension point if they later wire
 * the view to live `RoleEntry[]` data.
 */
export interface RolesTermsChartViewProps {
	/** Optional override for the seeded role entries. Reserved for future use. */
	organizationId?: string;
}

export function createRolesTermsChartViewProps(
	overrides: Partial<RolesTermsChartViewProps> = {},
): RolesTermsChartViewProps {
	return { ...overrides };
}
