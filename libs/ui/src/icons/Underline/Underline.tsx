import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Underline = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Underline</title>
    <path
      d="M4.16669 3V7.08334C4.16669 8.0116 4.53544 8.90184 5.19181 9.55821C5.84819 10.2146 6.73843 10.5833 7.66669 10.5833C8.59495 10.5833 9.48519 10.2146 10.1416 9.55821C10.7979 8.90184 11.1667 8.0116 11.1667 7.08334V3"
      stroke={cssVar('weakTextColor')}
      strokeWidth="1.3125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 13.5H12.3333"
      stroke={cssVar('weakerTextColor')}
      strokeWidth="1.225"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
