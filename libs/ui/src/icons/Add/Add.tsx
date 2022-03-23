import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Add = (): ReturnType<FC> => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={cssVar('currentTextColor')}
    >
      <title>Add</title>
      <path
        d="M8 4V12"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M4 8H12"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
