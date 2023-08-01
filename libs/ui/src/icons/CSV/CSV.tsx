import { FC } from 'react';
import { cssVar } from '../../primitives';

export const CSV = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Comma Separated Values</title>
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />

    <g clipPath="url(#clip0_507_34793)">
      <path
        d="M20.75 12.75H15.75C14.6454 12.75 13.75 13.6454 13.75 14.75V25.25C13.75 26.3546 14.6454 27.25 15.75 27.25H20.25M20.75 12.75V16.25C20.75 17.3546 21.6454 18.25 22.75 18.25H26.25L20.75 12.75Z"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.2173 22.2655L23.788 29.3313C23.8192 29.7172 24.3258 29.8381 24.5279 29.5079L25.9549 27.176C26.0252 27.0611 26.1486 26.9893 26.2833 26.985L29.6763 26.8763C30.0604 26.8639 30.2078 26.3698 29.8932 26.149L23.8458 21.9059C23.5685 21.7113 23.1901 21.9279 23.2173 22.2655Z"
        fill={cssVar('iconColorMain')}
        stroke={cssVar('iconColorDefault')}
        strokeWidth="1.3"
      />
    </g>
    <defs>
      <clipPath id="clip0_507_34793">
        <rect
          width="24"
          height="24"
          fill={cssVar('iconColorMain')}
          transform="translate(8 8)"
        />
      </clipPath>
    </defs>
  </svg>
);
