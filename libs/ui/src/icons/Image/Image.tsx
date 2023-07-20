import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Image = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Image</title>
    <rect width="40" height="40" rx="8" fill={cssVar('slashColorLight')} />

    <path
      d="M13 13H27L26.5 19L23 17L19 20H16.5L13 22.5V13Z"
      fill={cssVar('backgroundColor')}
    />
    <path
      d="M25.25 12.75H14.75C13.6454 12.75 12.75 13.6454 12.75 14.75V25.25C12.75 26.3546 13.6454 27.25 14.75 27.25H25.25C26.3546 27.25 27.25 26.3546 27.25 25.25V14.75C27.25 13.6454 26.3546 12.75 25.25 12.75Z"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.75 24L15.4962 20.5067C16.2749 19.5161 17.7645 19.4837 18.5856 20.4395L21 23.25"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.915 20.823C19.9522 19.5037 21.3973 17.6346 21.4913 17.513L21.5013 17.5002C22.2814 16.516 23.7663 16.4858 24.5856 17.4395L27 20.25"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
