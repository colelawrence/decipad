import { FC } from 'react';
import { cssVar } from '../primitives';

export const Activity = (): ReturnType<FC> => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Activity</title>
    <path
      d="M4.75 11.75H8.25L10.25 4.75L13.75 19.25L15.75 11.75H19.25"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
