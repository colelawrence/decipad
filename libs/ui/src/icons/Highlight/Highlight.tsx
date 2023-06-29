import { FC } from 'react';
import { cssVar, yellow500 } from '../../primitives';

export const Highlight = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>highlight</title>
    <path
      d="M9.94119 10.4117H7.05884V13.2941L9.94119 12.4706V10.4117Z"
      fill={yellow500.rgb}
    />
    <path
      d="M5 3V5.05882C5.68627 6.29412 6.64706 9.09412 6.64706 10.4118H10.3529C10.3529 9.17647 12 5.05882 12 5.05882V3"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.23529"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.05884 13.2941V10.4117H9.94119V12.0588L7.05884 13.2941Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.23529"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 5.05884H12"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.23529"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
