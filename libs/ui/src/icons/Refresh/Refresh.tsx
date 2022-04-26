import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Refresh = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Refresh</title>
      <path
        d="M7.48274 3L5.75861 4.55172L7.48274 6.10345"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.4483 4.5517H8.8621C11.1474 4.5517 13 6.40431 13 8.68963V8.86204"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.55172 11.4483H7.13793C4.85261 11.4483 3 9.59566 3 7.31035V7.13794"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.51721 13L10.2413 11.4483L8.51721 9.89655"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
