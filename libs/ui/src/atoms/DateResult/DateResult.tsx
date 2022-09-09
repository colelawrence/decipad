import { FC } from 'react';
import { DateTime } from 'luxon';
import { CodeResultProps } from '../../types';

export const formatUTCDate = (date: Date, form: string, tz = false): string => {
  const dateTime = DateTime.fromMillis(date.valueOf()).toUTC();
  return dateTime.toFormat(form) + (tz ? ' UTC' : '');
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
      format = 'yyyy';
      break;
    }
    case 'month': {
      format = 'MMM yyyy';
      break;
    }
    case 'day': {
      format = 'MMM d yyyy';
      break;
    }
    default: {
      if (date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0) {
        fullUTC = true;
        format = 'MMM d yyyy HH:mm';
      }
      break;
    }
  }

  const string = format
    ? formatUTCDate(date, format, fullUTC)
    : date.toISOString();
  return <span data-highlight-changes>{string}</span>;
};
