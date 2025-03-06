import {
  startOfDay,
  endOfDay,
  subDays,
  subYears,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { Interval, LastPeriod } from './types';

export function getPeriodComparison(
  startDate: Date | null,
  interval: Interval,
  lastPeriod: LastPeriod
) {
  let beginStartDate = startDate; // startDate can be in the middle of the period when toggling from one period to another
  let endDate: Date | null = null;
  let compareStartDate: Date | null = null;
  let compareEndDate: Date | null = null;

  if (startDate) {
    // Calculate end date for current period
    switch (interval.toLowerCase()) {
      case 'day':
        beginStartDate = startOfDay(startDate);
        endDate = endOfDay(beginStartDate);
        compareStartDate =
          lastPeriod === 'last-period'
            ? subDays(beginStartDate, 1)
            : subYears(beginStartDate, 1);
        compareEndDate = endOfDay(compareStartDate);
        break;
      case 'week':
        beginStartDate = startOfWeek(startDate);
        endDate = endOfWeek(beginStartDate);
        compareStartDate =
          lastPeriod === 'last-period'
            ? subWeeks(beginStartDate, 1)
            : startOfWeek(subYears(startDate, 1)); // to preserve same week number
        compareEndDate = endOfWeek(compareStartDate);
        break;
      case 'month':
        beginStartDate = startOfMonth(startDate);
        endDate = endOfMonth(beginStartDate);
        compareStartDate =
          lastPeriod === 'last-period'
            ? subMonths(beginStartDate, 1)
            : subYears(beginStartDate, 1);
        compareEndDate = endOfMonth(compareStartDate);
        break;
      case 'quarter':
        beginStartDate = startOfQuarter(startDate);
        endDate = endOfQuarter(beginStartDate);
        compareStartDate =
          lastPeriod === 'last-period'
            ? subQuarters(beginStartDate, 1)
            : subYears(beginStartDate, 1);
        compareEndDate = endOfQuarter(compareStartDate);
        break;
      case 'year':
        beginStartDate = startOfYear(startDate);
        endDate = endOfYear(beginStartDate);
        compareStartDate = subYears(beginStartDate, 1);
        compareEndDate = endOfYear(compareStartDate);
        break;
    }
  }
  return { beginStartDate, endDate, compareStartDate, compareEndDate };
}
