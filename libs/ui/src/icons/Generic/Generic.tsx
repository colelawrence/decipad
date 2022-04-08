import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Generic = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>generic</title>
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="6"
        fill={cssVar('iconBackgroundColor')}
      />
      <path
        d="M14 2L2 14"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.11429"
      />
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="6"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.11429"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
