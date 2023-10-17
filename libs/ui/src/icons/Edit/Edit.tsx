import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Edit: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
    <title>Edit</title>
    <path
      d="M9.00684 4.5C9.98315 5.47632 10.5305 6.02368 11.5068 7"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 13L5.93264 12.31L12.7979 5.44471C13.0674 5.17524 13.0674 4.73834 12.7979 4.46886L11.5312 3.20211C11.2616 2.93263 10.8248 2.93263 10.5552 3.20211L3.69003 10.0674L3 13Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
