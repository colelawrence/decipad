import { FC } from 'react';
import { cssVar } from '../../primitives';

export const ImportTable = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Import Table</title>
    <rect width="40" height="40" rx="8" fill={cssVar('slashColorLight')} />

    <rect
      x="10.65"
      y="11.65"
      width="18.7"
      height="16.7"
      rx="3.35"
      fill={cssVar('backgroundColor')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <path
      d="M21.875 21.25L20.0329 21.25C18.2888 21.25 16.875 22.8618 16.875 24.85L16.875 25"
      stroke={cssVar('slashColorHeavy')}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.25 20L22.5 21.25L21.25 22.5"
      stroke={cssVar('slashColorHeavy')}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.65 15C10.65 13.1498 12.1498 11.65 14 11.65H26C27.8502 11.65 29.35 13.1498 29.35 15V16.35H10.65V15Z"
      fill={cssVar('slashColorLight')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
  </svg>
);
