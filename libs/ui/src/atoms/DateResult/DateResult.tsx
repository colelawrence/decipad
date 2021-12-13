import { FC } from 'react';
import { format as formatDate, utcToZonedTime } from 'date-fns-tz';
import { ResultTypeProps } from '../../lib/results';

export const formatUTCDate = (date: Date, form: string): string => {
  const zonedDate = utcToZonedTime(date, 'UTC');
  return formatDate(zonedDate, form, { timeZone: 'UTC' });
};

export const DateResult = ({
  type,
  value,
}: ResultTypeProps): ReturnType<FC> => {
  const dateArg = Array.isArray(value) ? value[0] : value;
  const date = dateArg instanceof Date ? dateArg : new Date(Number(dateArg));
  let format: string | undefined;
  switch (type.date) {
    case 'year': {
      format = 'uuuu';
      break;
    }
    case 'month': {
      format = 'MMM uuuu';
      break;
    }
    case 'day': {
      format = 'MMM do uuuu';
      break;
    }
    case 'time': {
      if (date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0) {
        format = 'MMM do uuuu kk:mm';
      }
      break;
    }
  }

  const string = format ? formatUTCDate(date, format) : date.toISOString();
  return <span>{string}</span>;
};
