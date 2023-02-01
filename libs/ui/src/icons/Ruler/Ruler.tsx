import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Ruler: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Distance</title>
    <path
      d="M19.25 8L16 4.75L4.75 16L8 19.25L19.25 8Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M6.39062 14.3594L7.25 15.25"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M10.3906 10.3594L11.25 11.25"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M14.3906 6.35938L15.25 7.25"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M8.39062 12.3594L9.25 13.25"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M12.3906 8.35938L13.25 9.25"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);
