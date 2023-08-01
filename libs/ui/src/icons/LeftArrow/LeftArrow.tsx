import { FC } from 'react';
import { cssVar } from '../../primitives';

interface LeftArrowProps {
  title?: string;
}

export const LeftArrow: FC<LeftArrowProps> = ({ title = 'Left Arrow' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>{title}</title>
    <path
      d="M14.75 8L6.25 8"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M1.67426 7.57574L5.22574 4.02426C5.60371 3.64629 6.25 3.91399 6.25 4.44853L6.25 11.5515C6.25 12.086 5.60372 12.3537 5.22574 11.9757L1.67426 8.42426C1.43995 8.18995 1.43995 7.81005 1.67426 7.57574Z"
      fill={cssVar('iconColorHeavy')}
    />
  </svg>
);
