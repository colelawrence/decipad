import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Percentage = (): ReturnType<FC> => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Percentage</title>
    <path
      d="M17.25 6.75L6.75 17.25"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17.25C16.6904 17.25 17.25 16.6904 17.25 16C17.25 15.3096 16.6904 14.75 16 14.75C15.3096 14.75 14.75 15.3096 14.75 16C14.75 16.6904 15.3096 17.25 16 17.25Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 9.25C8.69036 9.25 9.25 8.69036 9.25 8C9.25 7.30964 8.69036 6.75 8 6.75C7.30964 6.75 6.75 7.30964 6.75 8C6.75 8.69036 7.30964 9.25 8 9.25Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
