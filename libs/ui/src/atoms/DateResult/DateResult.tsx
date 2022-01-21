import { FC } from 'react';
import { format as formatDate, utcToZonedTime } from 'date-fns-tz';
import { CodeResultProps } from '../../types';

export const formatUTCDate = (date: Date, form: string): string => {
  const zonedDate = utcToZonedTime(date, 'UTC');
  return formatDate(zonedDate, form, { timeZone: 'UTC' });
};

export const DateResult = ({
  type,
  value,
}: CodeResultProps<'date'>): ReturnType<FC> => {
  const date = new Date(Number(value));
  let format;
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
    default: {
      if (date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0) {
        format = 'MMM do uuuu kk:mm';
      }
      break;
    }
  }

  const string = format ? formatUTCDate(date, format) : date.toISOString();
  return <span>{string}</span>;
};
