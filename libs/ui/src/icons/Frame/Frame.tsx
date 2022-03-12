import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Frame = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Frame</title>
      <path
        d="M11 6.5C11.9763 7.47632 12.5237 8.02368 13.5 9"
        stroke={cssVar('weakTextColor')}
        strokeWidth="1.3125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.99316 15.0067L7.92775 14.3162L14.7975 7.44634C15.0672 7.17668 15.0672 6.73949 14.7975 6.46983L13.53 5.20224C13.2603 4.93259 12.8231 4.93259 12.5534 5.20224L5.68366 12.0721L4.99316 15.0067Z"
        stroke={cssVar('normalTextColor')}
        strokeWidth="1.08752"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
