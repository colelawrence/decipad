import { FC } from 'react';
import { cssVar, strongOpacity } from '../../primitives';

export const ImportTable = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Import Table</title>
    <rect width={40} height={40} rx={6} fill={cssVar('slashColorLight')} />
    <rect
      x="4.65"
      y="4.56669"
      width="30.7"
      height="30.7833"
      rx="3.35"
      fill={cssVar('backgroundColor')}
      fillOpacity={strongOpacity}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <path
      d="M8 4.56669H32C33.8502 4.56669 35.35 6.06653 35.35 7.91669V12.7459H4.65V7.91669C4.65 6.06653 6.14985 4.56669 8 4.56669Z"
      fill={cssVar('slashColorLight')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <path
      d="M25.5 20L21.0789 20C16.8932 20 13.5 23.8683 13.5 28.64L13.5 29"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24 17L27 20L24 23"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 23.3333V28.6666"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M17.3333 26H22.6667"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
