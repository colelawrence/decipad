import { FC } from 'react';
import { cssVar } from '../../primitives';

export const LineChartSlash = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />
    <path
      d="M11.75 11.75V28.25H28.25"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.5625 13.8125L22.9028 22.4327L19.5417 19.0481L15.1875 24.125"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
