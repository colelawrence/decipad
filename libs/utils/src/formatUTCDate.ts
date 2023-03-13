import { DateTime } from 'luxon';

export const formatUTCDate = (date: Date, form: string, tz = false): string => {
  const dateTime = DateTime.fromMillis(date.valueOf()).toUTC();
  return dateTime.toFormat(form) + (tz ? ' UTC' : '');
};
