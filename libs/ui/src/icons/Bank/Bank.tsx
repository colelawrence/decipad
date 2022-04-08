import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Bank = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Bank</title>
      <path
        d="M14.25 19.25V11.5M18.25 11.5V19.25V11.5ZM5.75 19.25V11.5V19.25ZM9.75 19.25V11.5V19.25Z"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4.75L19.25 11.25H4.75L12 4.75Z"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 19.25H19.25"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
