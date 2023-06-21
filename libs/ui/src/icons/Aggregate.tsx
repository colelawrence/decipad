import { FC } from 'react';
import { cssVar } from '../primitives';

export const Aggregate = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Aggregate</title>
    <rect
      x="10"
      y="3"
      width="3"
      height="10"
      rx="1"
      fill={cssVar('highlightColor')}
    />
    <path
      d="M4.50016 4.83341L4.50016 4.50008C4.50016 3.7637 5.09712 3.16675 5.8335 3.16675L11.5002 3.16675C12.2365 3.16675 12.8335 3.7637 12.8335 4.50008L12.8335 11.5001C12.8335 12.2365 12.2365 12.8334 11.5002 12.8334L8 12.8334"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.83325 3.33325V12.6666"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 8V12"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 10L2.5 10"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
