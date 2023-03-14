import { FC } from 'react';
import { cssVar } from '../../primitives';

export const List = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>List</title>
    <g clipPath="url(#clip0_7715_775)">
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2.4"
        fill={cssVar('iconBackgroundColor')}
      />
      <rect
        x="1"
        y="8"
        width="14"
        height="7"
        rx="2.4"
        fill={cssVar('backgroundColor')}
      />
      <path
        d="M1.5 8H14.5"
        stroke={cssVar('strongTextColor')}
        strokeWidth="1.2"
      />
      <path
        d="M1.5 12.5V3.5C1.5 2.39543 2.39543 1.5 3.5 1.5H12.5C13.6046 1.5 14.5 2.39543 14.5 3.5V12.5C14.5 13.6046 13.6046 14.5 12.5 14.5H3.5C2.39543 14.5 1.5 13.6046 1.5 12.5Z"
        stroke={cssVar('strongTextColor')}
        strokeWidth="1.2"
      />
    </g>
    <defs>
      <clipPath id="clip0_7715_775">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
