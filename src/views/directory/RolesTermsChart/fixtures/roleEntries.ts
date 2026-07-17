import type { RoleEntry } from '../models/RoleEntry';

/**
 * Seed RoleEntry[] for the Roles & Terms chart proxy. Models a credit-union
 * style board so the chart exercises the cases product branches on:
 *
 *  - Multiple groups (Board of Directors, Finance, Audit, Governance) → the
 *    per-group colour assignment.
 *  - Re-elected members with several sequential terms → stacked bars on one row.
 *  - A 10+ year tenure (Margaret Powell, since 2013) → the brief's truncation
 *    concern; the timeline must render her full span without clipping.
 *  - Open-ended current terms (`TermEndDateOnly: null`) → bars that run to the
 *    chart's right edge.
 *  - An upcoming term that starts in the future → bar sits right of the "today"
 *    indicator and is excluded from served-time totals.
 *
 * Dates are fixed ISO strings (date-only) rather than offsets from `now` so the
 * fixture is deterministic across runs and snapshot-friendly.
 */
export const roleEntries: RoleEntry[] = [
	// Margaret Powell — 10+ year tenure, three consecutive Board terms, now Chair.
	{
		UserId: 'u-powell',
		UserFirstName: 'Margaret',
		UserLastName: 'Powell',
		GroupId: 'g-board',
		GroupName: 'Board of Directors',
		RoleId: 'r-chair',
		RoleName: 'Chair',
		TermNumber: 3,
		TermStartDateOnly: '2021-01-01',
		TermEndDateOnly: null,
	},
	{
		UserId: 'u-powell',
		UserFirstName: 'Margaret',
		UserLastName: 'Powell',
		GroupId: 'g-board',
		GroupName: 'Board of Directors',
		RoleId: 'r-chair',
		RoleName: 'Chair',
		TermNumber: 2,
		TermStartDateOnly: '2017-01-01',
		TermEndDateOnly: '2020-12-31',
	},
	{
		UserId: 'u-powell',
		UserFirstName: 'Margaret',
		UserLastName: 'Powell',
		GroupId: 'g-board',
		GroupName: 'Board of Directors',
		RoleId: 'r-chair',
		RoleName: 'Director',
		TermNumber: 1,
		TermStartDateOnly: '2013-03-01',
		TermEndDateOnly: '2016-12-31',
	},

	// James Okafor — Treasurer, chairs Finance; two terms, currently active.
	{
		UserId: 'u-okafor',
		UserFirstName: 'James',
		UserLastName: 'Okafor',
		GroupId: 'g-finance',
		GroupName: 'Finance Committee',
		RoleId: 'r-treasurer',
		RoleName: 'Treasurer',
		TermNumber: 2,
		TermStartDateOnly: '2022-07-01',
		TermEndDateOnly: '2026-06-30',
	},
	{
		UserId: 'u-okafor',
		UserFirstName: 'James',
		UserLastName: 'Okafor',
		GroupId: 'g-finance',
		GroupName: 'Finance Committee',
		RoleId: 'r-treasurer',
		RoleName: 'Treasurer',
		TermNumber: 1,
		TermStartDateOnly: '2018-07-01',
		TermEndDateOnly: '2022-06-30',
	},

	// Priya Nair — Secretary on Governance; single open-ended term.
	{
		UserId: 'u-nair',
		UserFirstName: 'Priya',
		UserLastName: 'Nair',
		GroupId: 'g-governance',
		GroupName: 'Governance Committee',
		RoleId: 'r-secretary',
		RoleName: 'Secretary',
		TermNumber: 1,
		TermStartDateOnly: '2023-01-01',
		TermEndDateOnly: null,
	},

	// Daniel Reyes — Audit chair, completed one term, re-elected for an overlapping second.
	{
		UserId: 'u-reyes',
		UserFirstName: 'Daniel',
		UserLastName: 'Reyes',
		GroupId: 'g-audit',
		GroupName: 'Audit Committee',
		RoleId: 'r-member',
		RoleName: 'Committee Member',
		TermNumber: 2,
		TermStartDateOnly: '2024-01-01',
		TermEndDateOnly: '2027-12-31',
	},
	{
		UserId: 'u-reyes',
		UserFirstName: 'Daniel',
		UserLastName: 'Reyes',
		GroupId: 'g-audit',
		GroupName: 'Audit Committee',
		RoleId: 'r-member',
		RoleName: 'Committee Member',
		TermNumber: 1,
		TermStartDateOnly: '2020-01-01',
		TermEndDateOnly: '2023-12-31',
	},

	// Sofia Alvarez — Director, current term plus a scheduled future renewal.
	{
		UserId: 'u-alvarez',
		UserFirstName: 'Sofia',
		UserLastName: 'Alvarez',
		GroupId: 'g-board',
		GroupName: 'Board of Directors',
		RoleId: 'r-director',
		RoleName: 'Director',
		TermNumber: 1,
		TermStartDateOnly: '2023-09-01',
		TermEndDateOnly: '2026-08-31',
	},
	{
		UserId: 'u-alvarez',
		UserFirstName: 'Sofia',
		UserLastName: 'Alvarez',
		GroupId: 'g-board',
		GroupName: 'Board of Directors',
		RoleId: 'r-director',
		RoleName: 'Director',
		TermNumber: 2,
		TermStartDateOnly: '2026-09-01',
		TermEndDateOnly: '2029-08-31',
	},

	// Thomas Lindqvist — newest member, single active Finance term.
	{
		UserId: 'u-lindqvist',
		UserFirstName: 'Thomas',
		UserLastName: 'Lindqvist',
		GroupId: 'g-finance',
		GroupName: 'Finance Committee',
		RoleId: 'r-member',
		RoleName: 'Committee Member',
		TermNumber: 1,
		TermStartDateOnly: '2025-02-01',
		TermEndDateOnly: '2028-01-31',
	},
];
