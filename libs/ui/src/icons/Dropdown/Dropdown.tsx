import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Dropdown: FC = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Dropdown</title>
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />

    <rect
      x="9.65"
      y="11.65"
      width="20.7"
      height="6.7"
      rx="2.35"
      fill={cssVar('iconColorMain')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
    />
    <path
      d="M22.65 11.65H28C29.2979 11.65 30.35 12.7021 30.35 14V16C30.35 17.2979 29.2979 18.35 28 18.35H22.65V11.65Z"
      fill={cssVar('iconColorMain')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
    />
    <rect
      x="13"
      y="14.5"
      width="7"
      height="1"
      rx="0.5"
      fill={cssVar('iconColorDefault')}
    />
    <rect
      x="11"
      y="23"
      width="18"
      height="1.3"
      rx="0.65"
      fill={cssVar('iconColorHeavy')}
    />
    <rect
      x="11"
      y="28.3"
      width="18"
      height="1.3"
      rx="0.65"
      fill={cssVar('iconColorDefault')}
    />
    <path
      d="M25.5 15.5L26.3586 14.6414C26.4367 14.5633 26.5633 14.5633 26.6414 14.6414L27.5 15.5"
      stroke={cssVar('iconColorHeavy')}
      strokeLinecap="round"
    />
  </svg>
);
