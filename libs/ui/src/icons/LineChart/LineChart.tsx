import { FC } from 'react';
import { cssVar } from '../../primitives';

export const LineChart = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 2V14H14"
      stroke={cssVar('textHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 3.5L10.1111 9.76923L7.66667 7.30769L4.5 11"
      stroke={cssVar('textHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
