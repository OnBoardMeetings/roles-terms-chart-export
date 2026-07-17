/**
 * Minimal proxy of product's RoleEntry model — the slice the Roles & Terms
 * chart reads. Product's real entries come from `RoleTermsStore` keyed by
 * organization and carry far more (limit linkage, audit metadata, privilege
 * flags); we shim only the fields RoleEntryChart.vue + ChartEntryListItem.vue
 * actually look at.
 *
 * Field names intentionally mirror product (PascalCase, `*DateOnly`) so a
 * designer copying this view into a scaffold can paste product logic with
 * minimal renaming.
 */
export interface RoleEntry {
	UserId: string;
	UserFirstName: string;
	UserLastName: string;
	GroupId: string;
	GroupName: string;
	RoleId: string;
	RoleName: string;
	/** Which term in the sequence this entry represents. `null` when untracked. */
	TermNumber: number | null;
	/** ISO date string (date-only) the term begins. */
	TermStartDateOnly: string;
	/** ISO date string (date-only) the term ends, or `null` for an open-ended term. */
	TermEndDateOnly: string | null;
}

/**
 * One row in the chart: a unique (user, group, role) triple with all of that
 * person's term entries collapsed under it. Product builds this in its
 * `collectionOfPeople` computed; we reproduce the same shape so the timeline
 * and the table read off identical data.
 */
export interface ChartPerson {
	/** `${UserId}-${GroupId}-${RoleId}` — stable identity for the row. */
	Id: string;
	UserId: string;
	UserFirstName: string;
	UserLastName: string;
	/** `${UserFirstName} ${UserLastName}` — convenience for the timeline label. */
	Name: string;
	GroupId: string;
	GroupName: string;
	RoleId: string;
	RoleName: string;
	Entries: RoleEntry[];
	/** Total served duration in milliseconds (future terms excluded, open terms run to today). */
	TimeServed: number;
}

export type SortField = 'name' | 'group' | 'role' | 'serviceYears';
