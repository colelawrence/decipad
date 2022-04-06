import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Input = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Input</title>
      <path
        d="M15.75 7.75H17.25C18.3546 7.75 19.25 8.64543 19.25 9.75V14.25C19.25 15.3546 18.3546 16.25 17.25 16.25H15.75M8.25 16.25H6.75C5.64543 16.25 4.75 15.3546 4.75 14.25V9.75C4.75 8.64543 5.64543 7.75 6.75 7.75H8.25"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.75 4.75H13.25"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.75 19.25H13.25"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 5V19"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
