import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Sun = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Sun</title>
    <path
      d="M8 11.75C10.0711 11.75 11.75 10.0711 11.75 8C11.75 5.92893 10.0711 4.25 8 4.25C5.92893 4.25 4.25 5.92893 4.25 8C4.25 10.0711 5.92893 11.75 8 11.75Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 2.25V1"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.93203 3.93106L3.05078 3.0498"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.25 8H1"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.93203 12.0684L3.05078 12.9496"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 13.75V15"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.0684 12.0684L12.9496 12.9496"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.75 8H15"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.0684 3.93106L12.9496 3.0498"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
