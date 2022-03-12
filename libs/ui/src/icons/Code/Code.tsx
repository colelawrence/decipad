import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Code = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Code</title>
      <path
        d="M11.9375 2.5625H4.0625C3.23407 2.5625 2.5625 3.23407 2.5625 4.0625V11.9375C2.5625 12.7659 3.23407 13.4375 4.0625 13.4375H11.9375C12.7659 13.4375 13.4375 12.7659 13.4375 11.9375V4.0625C13.4375 3.23407 12.7659 2.5625 11.9375 2.5625Z"
        fill={cssVar('iconBackgroundColor')}
        stroke={cssVar('currentTextColor')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5625 7.0625L7.4375 8.75L5.5625 10.4375"
        stroke={cssVar('currentTextColor')}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
