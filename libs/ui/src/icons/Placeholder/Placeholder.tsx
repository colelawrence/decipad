import { useState, FC } from 'react';
import { nanoid } from 'nanoid';

import { cssVar } from '../../primitives';

export const Placeholder = (): ReturnType<FC> => {
  const [clipPathId] = useState(nanoid);
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Placeholder</title>
      <g clipPath={`url(#${clipPathId})`}>
        <rect
          x="2"
          y="2"
          width="12"
          height="12"
          rx="6"
          fill={cssVar('iconBackground')}
        />
        <path
          d="M2 2L14 14"
          stroke={cssVar('iconColorDefault')}
          strokeWidth="1.11429"
        />
        <path
          d="M14 2L2 14"
          stroke={cssVar('iconColorHeavy')}
          strokeWidth="1.11429"
        />
      </g>
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="6"
        stroke={cssVar('iconColorDefault')}
        strokeWidth="1.11429"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <clipPath id={clipPathId}>
          <rect
            x="2"
            y="2"
            width="12"
            height="12"
            rx="6"
            fill={cssVar('iconColorMain')}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
