import { FC } from 'react';
import { cssVar } from '../primitives';

export const Wheat = (): ReturnType<FC> => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <title>Wheat</title>
    <path
      stroke={cssVar('iconColorHeavy')}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M12 19.25V4.75m.75 5.5v-1.5a3 3 0 0 1 3-3h1.5v1.5a3 3 0 0 1-3 3h-1.5Zm-1.5 0v-1.5a3 3 0 0 0-3-3h-1.5v1.5a3 3 0 0 0 3 3h1.5Zm1.5 7v-1.5a3 3 0 0 1 3-3h1.5v1.5a3 3 0 0 1-3 3h-1.5Zm-1.5 0v-1.5a3 3 0 0 0-3-3h-1.5v1.5a3 3 0 0 0 3 3h1.5Z"
    />
  </svg>
);
