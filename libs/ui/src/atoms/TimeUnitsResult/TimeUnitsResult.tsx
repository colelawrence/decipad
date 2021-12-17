import { FC } from 'react';
import plural from 'pluralize';

import { ResultProps } from '../../lib/results';

export const TimeUnitsResult = ({
  value: entries,
}: ResultProps<'time-quantity'>): ReturnType<FC> => {
  return (
    <span>
      {entries
        .map(([name, val]) => `${val} ${plural(name, Number(val))}`)
        .join(', ')}
    </span>
  );
};
