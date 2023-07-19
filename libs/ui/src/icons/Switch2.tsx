import { FC } from 'react';
import { cssVar } from '../primitives';

export const Switch2 = (): ReturnType<FC> => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <title>Switch</title>
    <path
      stroke={cssVar('currentTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M7.75 9.25v.01m8.5 4.99v.01m-11.5.99v-6.5a2 2 0 0 1 2-2h4v10.5h-4a2 2 0 0 1-2-2Zm14.5 0v-6.5a2 2 0 0 0-2-2h-4v10.5h4a2 2 0 0 0 2-2Z"
    />
  </svg>
);
