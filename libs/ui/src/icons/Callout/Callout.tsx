import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Callout = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Callout</title>
      <path
        d="M16.0279 11.75H7.97208C6.19252 11.75 4.75 11.4515 4.75 11.0833V9.41667C4.75 9.04848 6.19252 8.75 7.97208 8.75H16.0279C17.8072 8.75 19.25 9.04848 19.25 9.41667V11.0833C19.25 11.4515 17.8072 11.75 16.0279 11.75Z"
        stroke={cssVar('normalTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 5.75H19.25"
        stroke={cssVar('weakTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 15.25H19.25"
        stroke={cssVar('weakTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 18.25H19.25"
        stroke={cssVar('weakTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
