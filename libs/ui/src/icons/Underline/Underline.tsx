import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Underline = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Underline</title>
      <path
        d="M4 2V6.66667C4 7.72753 4.42143 8.74495 5.17157 9.49509C5.92172 10.2452 6.93913 10.6667 8 10.6667C9.06087 10.6667 10.0783 10.2452 10.8284 9.49509C11.5786 8.74495 12 7.72753 12 6.66667V2"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.66667 14H13.3333"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
