import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Pie = (): ReturnType<FC> => {
  return (
    <svg fill="none" viewBox="0 0 24 24">
      <title>Pie</title>
      <circle
        cx={12}
        cy={12}
        r="7.25"
        stroke={cssVar('currentTextColor')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        stroke={cssVar('currentTextColor')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M11.75 5V10.25C11.75 11.3546 12.6454 12.25 13.75 12.25H19"
      />
    </svg>
  );
};
