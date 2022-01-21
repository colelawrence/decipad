import { FC } from 'react';
import { format as formatDate } from 'date-fns-tz';
import { CodeResultProps } from '../../types';

export const formatUTCDate = (
  date: Date,
  form: string,
  fullUTC = false
): string => {
  return formatDate(date, form, { timeZone: 'UTC' }) + (fullUTC ? ' UTC' : '');
};

export const DateResult = ({
  type,
  value,
}: CodeResultProps<'date'>): ReturnType<FC> => {
  const date = new Date(Number(value));
  let fullUTC = false;
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
        fullUTC = true;
        format = 'MMM do uuuu HH:mm';
      }
      break;
    }
  }

  const string = format
    ? formatUTCDate(date, format, fullUTC)
    : date.toISOString();
  return <span>{string}</span>;
};
