import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Medal = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Medal</title>
      <path
        d="M14.25 8.75L18.25 4.75H5.75L9.75 8.75"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19.25C14.8995 19.25 17.25 16.8995 17.25 14C17.25 11.1005 14.8995 8.75 12 8.75C9.10051 8.75 6.75 11.1005 6.75 14C6.75 16.8995 9.10051 19.25 12 19.25Z"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
