import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Pin = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Pin</title>
      <path
        d="M18.25 11C18.25 15 12 19.25 12 19.25C12 19.25 5.75 15 5.75 11C5.75 7.5 8.68629 4.75 12 4.75C15.3137 4.75 18.25 7.5 18.25 11Z"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 13.25C13.2426 13.25 14.25 12.2426 14.25 11C14.25 9.75736 13.2426 8.75 12 8.75C10.7574 8.75 9.75 9.75736 9.75 11C9.75 12.2426 10.7574 13.25 12 13.25Z"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
