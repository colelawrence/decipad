import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Info = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Info</title>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM7 5V3H9V5H7ZM9 10H11V12H5V10H7V8H5V6H9V10Z"
      fill={cssVar('iconColorHeavy')}
    />
  </svg>
);
