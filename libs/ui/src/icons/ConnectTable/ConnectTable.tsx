import { FC } from 'react';
import { cssVar, strongOpacity } from '../../primitives';

export const ConnectTable = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Connect Table</title>
    <rect width={40} height={40} rx={6} fill={cssVar('slashColorLight')} />
    <rect
      x="4.65"
      y="4.56669"
      width="30.7"
      height="30.7833"
      rx="3.35"
      fill={cssVar('backgroundColor')}
      fillOpacity={strongOpacity}
    />
    <rect
      x="4.65"
      y="4.56669"
      width="30.7"
      height="30.7833"
      rx="3.35"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <rect
      x="4.65"
      y="4.56669"
      width="30.7"
      height="30.7833"
      rx="3.35"
      stroke={cssVar('backgroundColor')}
      fillOpacity={strongOpacity}
      strokeOpacity="0.08"
      strokeWidth="1.3"
    />
    <path
      d="M8 4.56669H32C33.8502 4.56669 35.35 6.06653 35.35 7.91669V12.7459H4.65V7.91669C4.65 6.06653 6.14985 4.56669 8 4.56669Z"
      fill={cssVar('slashColorLight')}
    />
    <path
      d="M8 4.56669H32C33.8502 4.56669 35.35 6.06653 35.35 7.91669V12.7459H4.65V7.91669C4.65 6.06653 6.14985 4.56669 8 4.56669Z"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <path
      d="M8 4.56669H32C33.8502 4.56669 35.35 6.06653 35.35 7.91669V12.7459H4.65V7.91669C4.65 6.06653 6.14985 4.56669 8 4.56669Z"
      stroke={cssVar('iconColorDark')}
      strokeOpacity="0.08"
      strokeWidth="1.3"
    />
    <path
      d="M18.75 25.25H14.75L21.25 16.75V22.75H25.25L18.75 31.25V25.25Z"
      fill={cssVar('backgroundColor')}
      fillOpacity={strongOpacity}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
