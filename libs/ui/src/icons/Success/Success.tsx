import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Success = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Success</title>
      <path
        d="M2 8C2 4.6863 4.6863 2 8 2C11.3137 2 14 4.6863 14 8C14 11.3137 11.3137 14 8 14C4.6863 14 2 11.3137 2 8Z"
        fill={cssVar('iconBackgroundColor')}
        stroke={cssVar('normalTextColor')}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 8.66667L6.38551 9.48836C6.69111 10.1396 7.6032 10.1771 7.96124 9.55316L10 6"
        stroke={cssVar('normalTextColor')}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
