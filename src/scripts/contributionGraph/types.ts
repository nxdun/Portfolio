export type ContributionLegendItem = {
  level: number;
  label: string;
  min: number;
  max: number;
  color: string;
};

export type ContributionMonthItem = {
  label: string;
  weekIndex: number;
};

export type ContributionCell = {
  date: string;
  weekIndex: number;
  weekday: number;
  weekdayLabel: string;
  count: number;
  level: number;
  color: string;
  isFuture: boolean;
  isInCurrentMonth: boolean;
};

export type ContributionGraphResponse = {
  username: string;
  summary: {
    totalContributions: number;
    totalWeeks: number;
    maxDailyCount: number;
  };
  legend: ContributionLegendItem[];
  months: ContributionMonthItem[];
  cells: ContributionCell[];
  meta: {
    provider: string;
    cached: boolean;
    cacheTtlSeconds: number;
    fetchedAt: string;
    schemaVersion: number;
  };
};

export type ContributionGraphState =
  | "idle"
  | "loading"
  | "resolving"
  | "resolved"
  | "empty"
  | "error";
