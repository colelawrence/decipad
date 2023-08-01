import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Slash = (): ReturnType<FC> => (
  <svg viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Slash</title>
    <path
      d="M3.11358 12.75L7.11361 3.25002"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
