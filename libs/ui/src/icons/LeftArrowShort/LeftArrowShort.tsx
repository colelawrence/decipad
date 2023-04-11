import { FC } from 'react';
import { cssVar } from '../../primitives';

export const LeftArrowShort = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Left Arrow</title>
    <path
      d="M13.2499 8.25012L4.74994 8.25012"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M2.1742 7.82586L5.72567 4.27439C6.10365 3.89641 6.74994 4.16411 6.74994 4.69865L6.74994 11.8016C6.74994 12.3361 6.10365 12.6038 5.72568 12.2259L2.1742 8.67439C1.93989 8.44007 1.93989 8.06017 2.1742 7.82586Z"
      fill={cssVar('currentTextColor')}
    />
  </svg>
);
