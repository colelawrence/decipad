import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Heading1 = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Heading1</title>
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />
    <path
      d="M11.2539 26.5V14.1364H12.7511V19.642H19.3434V14.1364H20.8406V26.5H19.3434V20.9702H12.7511V26.5H11.2539Z"
      fill={cssVar('iconColorHeavy')}
    />
    <path
      d="M27.9672 14.1364V26.5H26.47V15.706H26.3975L23.3791 17.7102V16.1889L26.47 14.1364H27.9672Z"
      fill={cssVar('iconColorHeavy')}
    />
  </svg>
);
