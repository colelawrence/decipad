import { FC } from 'react';
import { cssVar } from '../../primitives';

export const NestIndicator = (): ReturnType<FC> => (
  <svg viewBox="0 0 13 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Nest Indicator</title>
    <path
      d="M1 2V10C1 12.2091 2.79086 14 5 14H13"
      stroke={cssVar('iconColorHeavy')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.3px"
    />
  </svg>
);
