import { FC } from 'react';
import plural from 'pluralize';

import { ResultTypeProps } from '../../lib/results';

export const TimeUnitsResult = ({
  value: entries,
}: ResultTypeProps): ReturnType<FC> => {
  return (
    <span>
      {(entries as [string, number][])
        .map(([name, val]) => `${val} ${plural(name, val)}`)
        .join(', ')}
    </span>
  );
};
