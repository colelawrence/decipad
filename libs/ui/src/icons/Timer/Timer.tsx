import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Timer: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.25 13C18.25 16.4518 15.4518 19.25 12 19.25C8.54822 19.25 5.75 16.4518 5.75 13C5.75 9.54822 8.54822 6.75 12 6.75C15.4518 6.75 18.25 9.54822 18.25 13Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M16.5 8.5L17.25 7.75"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M12 6.5V4.75M12 4.75H9.75M12 4.75H14.25"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
    <path
      d="M12 9.75V13.25"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);
