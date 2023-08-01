import { FC } from 'react';
import { cssVar } from '../../primitives';

export const TableSlash = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Table Slash</title>
    <rect width={40} height={40} rx={8} fill={cssVar('iconBackground')} />
    <rect
      x="10.65"
      y="11.65"
      width="18.7"
      height="16.7"
      rx="3.35"
      fill={cssVar('iconColorMain')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
    />
    <path
      d="M10.65 15C10.65 13.1498 12.1498 11.65 14 11.65H26C27.8502 11.65 29.35 13.1498 29.35 15V16.35H10.65V15Z"
      fill={cssVar('iconBackground')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
    />
    <line
      x1={11}
      y1="21.85"
      x2={29}
      y2="21.85"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
    />
    <line
      x1="20.15"
      y1={16}
      x2="20.15"
      y2={29}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
    />
  </svg>
);
