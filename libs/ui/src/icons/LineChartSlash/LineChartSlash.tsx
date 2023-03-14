import { FC } from 'react';
import { orange100, orange500 } from '../../primitives';

export const LineChartSlash = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="6" fill={orange100.rgb} />
    <path
      d="M11.75 11.75V28.25H28.25"
      stroke={orange500.rgb}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.5625 13.8125L22.9028 22.4327L19.5417 19.0481L15.1875 24.125"
      stroke={orange500.rgb}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
