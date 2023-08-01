import { FC } from 'react';
import { cssVar } from '../../primitives';

interface RightArrowProps {
  title?: string;
}

export const RightArrow: FC<RightArrowProps> = ({ title = 'Right Arrow' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>{title}</title>
    <path
      d="M1.25 8L9.75 8"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M14.3257 8.42426L10.7743 11.9757C10.3963 12.3537 9.75 12.086 9.75 11.5515L9.75 4.44853C9.75 3.91399 10.3963 3.64628 10.7743 4.02426L14.3257 7.57574C14.5601 7.81005 14.5601 8.18995 14.3257 8.42426Z"
      fill={cssVar('iconColorHeavy')}
    />
  </svg>
);
