import { expect, describe, it } from 'vitest';
import { getPeriodComparison } from './getPeriodComparison';

describe('getPeriodComparison', () => {
  // Helper to create a fixed date for consistent testing
  const createDate = (year: number, month: number, day: number) =>
    new Date(year, month - 1, day);

  describe('with null date', () => {
    it('returns null values when startDate is null', () => {
      const result = getPeriodComparison(null, 'Month', 'last-period');
      expect(result).toEqual({
        beginStartDate: null,
        endDate: null,
        compareStartDate: null,
        compareEndDate: null,
      });
    });
  });

  describe('day interval', () => {
    // Using March 15, 2024 as our reference date
    const baseDate = createDate(2024, 3, 15);

    it('handles day comparison with last-period', () => {
      // Compare March 15, 2024 with March 14, 2024
      const result = getPeriodComparison(baseDate, 'Day', 'last-period');

      expect(result.beginStartDate).toEqual(createDate(2024, 3, 15)); // March 15
      expect(result.endDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 3, 15).setHours(23, 59, 59, 999)
        ).toISOString() // End of March 15
      );
      expect(result.compareStartDate).toEqual(createDate(2024, 3, 14)); // March 14
      expect(result.compareEndDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 3, 14).setHours(23, 59, 59, 999)
        ).toISOString() // End of March 14
      );
    });

    it('handles day comparison with last-year', () => {
      // Compare March 15, 2024 with March 15, 2023
      const result = getPeriodComparison(baseDate, 'Day', 'last-year');

      expect(result.beginStartDate).toEqual(createDate(2024, 3, 15)); // March 15, 2024
      expect(result.endDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 3, 15).setHours(23, 59, 59, 999)
        ).toISOString()
      );
      expect(result.compareStartDate).toEqual(createDate(2023, 3, 15)); // March 15, 2023
      expect(result.compareEndDate?.toISOString()).toBe(
        new Date(
          createDate(2023, 3, 15).setHours(23, 59, 59, 999)
        ).toISOString()
      );
    });
  });

  describe('month interval', () => {
    // Using March 15, 2024 as our reference date
    const baseDate = createDate(2024, 3, 15);

    it('handles month comparison with last-period', () => {
      // Compare March 2024 with February 2024
      const result = getPeriodComparison(baseDate, 'Month', 'last-period');

      expect(result.beginStartDate).toEqual(createDate(2024, 3, 1)); // Start of March
      expect(result.endDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 3, 31).setHours(23, 59, 59, 999)
        ).toISOString() // End of March
      );
      expect(result.compareStartDate).toEqual(createDate(2024, 2, 1)); // Start of February
      expect(result.compareEndDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 2, 29).setHours(23, 59, 59, 999)
        ).toISOString() // End of February (leap year)
      );
    });

    it('handles month comparison with last-year', () => {
      // Compare March 2024 with March 2023
      const result = getPeriodComparison(baseDate, 'Month', 'last-year');

      expect(result.beginStartDate).toEqual(createDate(2024, 3, 1)); // March 2024
      expect(result.endDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 3, 31).setHours(23, 59, 59, 999)
        ).toISOString()
      );
      expect(result.compareStartDate).toEqual(createDate(2023, 3, 1)); // March 2023
      expect(result.compareEndDate?.toISOString()).toBe(
        new Date(
          createDate(2023, 3, 31).setHours(23, 59, 59, 999)
        ).toISOString()
      );
    });
  });

  describe('quarter interval', () => {
    // Using February 15, 2024 (Q1) as our reference date
    const baseDate = createDate(2024, 2, 15);

    it('handles quarter comparison with last-period', () => {
      // Compare Q1 2024 with Q4 2023
      const result = getPeriodComparison(baseDate, 'Quarter', 'last-period');

      expect(result.beginStartDate).toEqual(createDate(2024, 1, 1)); // Start of Q1 2024
      expect(result.endDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 3, 31).setHours(23, 59, 59, 999)
        ).toISOString() // End of Q1 2024
      );
      expect(result.compareStartDate).toEqual(createDate(2023, 10, 1)); // Start of Q4 2023
      expect(result.compareEndDate?.toISOString()).toBe(
        new Date(
          createDate(2023, 12, 31).setHours(23, 59, 59, 999)
        ).toISOString() // End of Q4 2023
      );
    });
  });

  describe('year interval', () => {
    // Using June 15, 2024 as our reference date
    const baseDate = createDate(2024, 6, 15);

    it('handles year comparison (only last-period available)', () => {
      // Compare 2024 with 2023
      const result = getPeriodComparison(baseDate, 'Year', 'last-period');

      expect(result.beginStartDate).toEqual(createDate(2024, 1, 1)); // Start of 2024
      expect(result.endDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 12, 31).setHours(23, 59, 59, 999)
        ).toISOString() // End of 2024
      );
      expect(result.compareStartDate).toEqual(createDate(2023, 1, 1)); // Start of 2023
      expect(result.compareEndDate?.toISOString()).toBe(
        new Date(
          createDate(2023, 12, 31).setHours(23, 59, 59, 999)
        ).toISOString() // End of 2023
      );
    });
  });

  describe('week interval', () => {
    // Using March 15, 2024 (Friday) as our reference date
    const baseDate = createDate(2024, 3, 15);

    it('handles week comparison with last-period', () => {
      // Compare week of March 15, 2024 with previous week
      const result = getPeriodComparison(baseDate, 'Week', 'last-period');

      expect(result.beginStartDate).toEqual(createDate(2024, 3, 10)); // Start of week (Sunday)
      expect(result.endDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 3, 16).setHours(23, 59, 59, 999)
        ).toISOString() // End of week (Saturday)
      );
      expect(result.compareStartDate).toEqual(createDate(2024, 3, 3)); // Start of previous week
      expect(result.compareEndDate?.toISOString()).toBe(
        new Date(createDate(2024, 3, 9).setHours(23, 59, 59, 999)).toISOString() // End of previous week
      );
    });

    it('handles week comparison with last-year', () => {
      // Compare week of March 15, 2024 with same week last year
      const result = getPeriodComparison(baseDate, 'Week', 'last-year');

      expect(result.beginStartDate).toEqual(createDate(2024, 3, 10)); // Start of current week
      expect(result.endDate?.toISOString()).toBe(
        new Date(
          createDate(2024, 3, 16).setHours(23, 59, 59, 999)
        ).toISOString() // End of current week
      );
      expect(result.compareStartDate).toEqual(createDate(2023, 3, 12)); // Start of same week last year
      expect(result.compareEndDate?.toISOString()).toBe(
        new Date(
          createDate(2023, 3, 18).setHours(23, 59, 59, 999)
        ).toISOString() // End of same week last year
      );
    });
  });
});
