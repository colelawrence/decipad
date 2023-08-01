import { FC } from 'react';
import { cssVar } from '../../primitives';

export const BarChart = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Bar Chart</title>
    <path
      d="M3.8 5H3.2C2.53726 5 2 5.41787 2 5.93333V11.0667C2 11.5821 2.53726 12 3.2 12H3.8C4.46274 12 5 11.5821 5 11.0667V5.93333C5 5.41787 4.46274 5 3.8 5Z"
      fill={cssVar('borderSubdued')}
      stroke={cssVar('textHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.39961 2H7.79961C7.13685 2 6.59961 2.38932 6.59961 2.86957V11.1304C6.59961 11.6107 7.13685 12 7.79961 12H8.39961C9.06237 12 9.59961 11.6107 9.59961 11.1304V2.86957C9.59961 2.38932 9.06237 2 8.39961 2Z"
      fill={cssVar('iconBackground')}
      stroke={cssVar('textHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 14H14"
      stroke={cssVar('textHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.8 5H12.2C11.5372 5 11 5.41787 11 5.93333V11.0667C11 11.5821 11.5372 12 12.2 12H12.8C13.4628 12 14 11.5821 14 11.0667V5.93333C14 5.41787 13.4628 5 12.8 5Z"
      stroke={cssVar('textHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
