import { FC } from 'react';
import { blue100, blue200, blue500 } from '../../primitives';

export const Sketch = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Sketch</title>
    <rect width="40" height="40" rx="6" fill={blue100.rgb} />
    <path
      d="M21.0002 29.6327L28.6328 22M28.6328 22L28.6328 28M28.6328 22L22.5 22"
      stroke={blue500.rgb}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="13"
      cy="21"
      r="4"
      stroke={blue500.rgb}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="25"
      y="10"
      width="5"
      height="5"
      stroke={blue500.rgb}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 11H20V14.5"
      stroke={blue200.rgb}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
