import { isValid, parse, format as externalFormatDate } from 'date-fns';
// import { getTimezoneOffset } from 'date-fns-tz';
import { DateTime } from 'luxon';

export const printDate = (date: bigint | undefined) =>
  DateTime.fromMillis(Number(date)).toUTC().toString();

const isValidDate = (d: Date | undefined): d is Date => {
  return d != null && !Number.isNaN(d.valueOf());
};

export const dateFromMillis = (millis: bigint | number): DateTime =>
  DateTime.fromMillis(Number(millis)).toUTC();

const universalFormat = 'yyyy-MM-dd HH:mm:ss';

export const parseDate = (text: string, format: string): bigint | undefined => {
  const refDate = new Date();
  const date = parse(text, format, refDate);
  if (!isValid(date) || !isValidDate(date)) {
    return undefined;
  }

  const str = externalFormatDate(date, universalFormat);
  const utcDate = DateTime.fromFormat(str, universalFormat, { zone: 'utc' });
  return BigInt(utcDate.toMillis());
};

export type TimeSpecificity = 'quarter'; // only quarter for now

export const formatDate = (date: bigint, format: string) =>
  dateFromMillis(date).toFormat(format);

export const startOfDate = (
  date: bigint,
  specificity: TimeSpecificity
): bigint => BigInt(dateFromMillis(date).startOf(specificity).toMillis());
