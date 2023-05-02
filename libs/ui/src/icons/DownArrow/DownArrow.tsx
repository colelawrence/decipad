import { FC } from 'react';
import { cssVar } from '../../primitives';

export const DownArrow: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Down Arrow</title>
    <path
      d="M17.25 13.75L12 19.25L6.75 13.75"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 18.25V4.75"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
