import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Plus = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Plot</title>
      <path
        d="M10 6.5V14.5"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M6 10.5H14"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
