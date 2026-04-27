/**
 * A legend item defining a contribution level and its bounds.
 */
export type ContributionLegendItem = {
  /** The 0-based index/level. */
  readonly level: number;
  /** A human-readable label or range string. */
  readonly label: string;
  /** The minimum contribution count for this level. */
  readonly min: number;
  /** The maximum contribution count for this level. */
  readonly max: number;
  /** The hex color associated with this level. */
  readonly color: string;
};

/**
 * A month label pinned to a specific week index.
 */
export type ContributionMonthItem = {
  /** The short or full name of the month. */
  readonly label: string;
  /** The 0-based week index this month starts or belongs to. */
  readonly weekIndex: number;
};

/**
 * A single day's contribution cell in the graph grid.
 */
export type ContributionCell = {
  /** Target date as an ISO string (e.g., YYYY-MM-DD). */
  readonly date: string;
  /** 0-based index of the week within the grid. */
  readonly weekIndex: number;
  /** 0-6 indicating the day of the week (e.g., 0 = Sunday). */
  readonly weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Unabbreviated or short weekday label (e.g., "Mon"). */
  readonly weekdayLabel: string;
  /** Total contributions made on this day. */
  readonly count: number;
  /** The resolved level mapped to the legend. */
  readonly level: number;
  /** Resolved background color for the cell. */
  readonly color: string;
  /** True if the date represents a future date in the current calendar year. */
  readonly isFuture: boolean;
  /** True if the date falls in the currently rendered month. */
  readonly isInCurrentMonth: boolean;
};

/**
 * The full, validated contribution graph response from the backend.
 */
export type ContributionGraphResponse = {
  /** Target GitHub username. */
  readonly username: string;
  /** Date range covered by the dataset. */
  readonly range: {
    readonly from: string;
    readonly to: string;
    readonly timezone: string;
  };
  readonly summary: {
    readonly totalContributions: number;
    readonly totalWeeks: number;
    readonly maxDailyCount: number;
  };
  readonly legend: readonly ContributionLegendItem[];
  readonly months: readonly ContributionMonthItem[];
  readonly cells: readonly ContributionCell[];
  readonly meta: {
    readonly provider: "github";
    readonly cached: boolean;
    readonly cacheTtlSeconds: number;
    readonly fetchedAt: string;
    readonly schemaVersion: number;
  };
};

export type ContributionGraphState =
  | "idle"
  | "loading"
  | "resolving"
  | "resolved"
  | "empty"
  | "error";
