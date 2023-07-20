import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Calculations = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>SlashCommandCal</title>
    <rect width="40" height="40" rx="8" fill={cssVar('slashColorLight')} />

    <path
      d="M22 27V23C22 22.4477 22.4477 22 23 22H27C27.5523 22 28 22.4477 28 23V27C28 27.5523 27.5523 28 27 28H23C22.4477 28 22 27.5523 22 27Z"
      fill={cssVar('backgroundColor')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <path
      d="M12 28.4346V22.5232C12 22.2867 12.2525 22.1359 12.4607 22.248L17.5276 24.9764C17.7385 25.09 17.7485 25.3888 17.5457 25.5162L12.4787 28.6993C12.2706 28.83 12 28.6804 12 28.4346Z"
      fill={cssVar('slashColorLight')}
      stroke={cssVar('slashColorNormal')}
      strokeWidth="1.3"
    />
    <circle
      cx={15}
      cy={15}
      r="3.35"
      fill={cssVar('backgroundColor')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
    />
    <path
      d="M22 18L29 11M22 11L29 18"
      stroke={cssVar('slashColorNormal')}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);
