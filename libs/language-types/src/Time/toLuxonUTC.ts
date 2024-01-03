import { DateTime } from 'luxon';

export const toLuxonUTC = (date: bigint | number | DateTime) => {
  if (typeof date === 'bigint') {
    date = Number(date);
  }
  if (date instanceof DateTime) {
    return date.toUTC();
  }
  // if (date == null)
  if (typeof date !== 'number') {
    throw new Error(
      `panic: toLuxon(date) passed an invalid date: ${date} (${typeof date})`
    );
  }
  return DateTime.fromMillis(date).toUTC();
};
