import { FC } from 'react';
import { cssVar } from '../../primitives';

export const ScatterPlot = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 2V14H14"
      stroke={cssVar('textHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 10C11.5523 10 12 9.55228 12 9C12 8.44772 11.5523 8 11 8C10.4477 8 10 8.44772 10 9C10 9.55228 10.4477 10 11 10Z"
      fill={cssVar('iconBackground')}
      stroke={cssVar('textHeavy')}
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 8C8.55228 8 9 7.55228 9 7C9 6.44772 8.55228 6 8 6C7.44772 6 7 6.44772 7 7C7 7.55228 7.44772 8 8 8Z"
      fill={cssVar('iconBackground')}
      stroke={cssVar('textHeavy')}
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 11C5.55228 11 6 10.5523 6 10C6 9.44772 5.55228 9 5 9C4.44772 9 4 9.44772 4 10C4 10.5523 4.44772 11 5 11Z"
      fill={cssVar('iconBackground')}
      stroke={cssVar('textHeavy')}
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 6C13.5523 6 14 5.55228 14 5C14 4.44772 13.5523 4 13 4C12.4477 4 12 4.44772 12 5C12 5.55228 12.4477 6 13 6Z"
      fill={cssVar('iconBackground')}
      stroke={cssVar('textHeavy')}
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
