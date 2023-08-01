import { FC } from 'react';
import { cssVar } from '../../primitives';

export const UpArrow: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Up Arrow</title>
    <path
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M17.25 10.25L12 4.75L6.75 10.25"
      stroke={cssVar('iconColorHeavy')}
      strokeLinecap="round"
    />
    <path
      d="M12 19.25V5.75"
      strokeLinejoin="round"
      strokeWidth="1.5"
      stroke={cssVar('iconColorHeavy')}
      strokeLinecap="round"
    />
  </svg>
);
