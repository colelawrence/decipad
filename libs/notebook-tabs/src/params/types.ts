export const intervals = ['Day', 'Week', 'Month', 'Quarter', 'Year'] as const;
export const lastPeriods = ['last-period', 'last-year'] as const;

export type Interval = typeof intervals[number];
export type LastPeriod = typeof lastPeriods[number];

export const DEFAULT_INTERVAL = 'Month' as Interval;
export const DEFAULT_LAST_PERIOD = 'last-period' as LastPeriod;
