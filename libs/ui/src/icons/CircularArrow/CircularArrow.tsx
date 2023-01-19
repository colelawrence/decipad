import { FC } from 'react';
import { cssVar } from '../../primitives';

export interface CircularArrowProps {}

export const CircularArrow: FC<CircularArrowProps> = () => {
  const strokeTop = cssVar('weakTextColor');
  const strokeBottom = cssVar('normalTextColor');

  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Circular Arrow</title>
      <path
        d="M7.50065 9.83337L5.83398 11.3334M5.83398 11.3334L7.50065 12.8334M5.83398 11.3334H8.83398C11.0431 11.3334 12.834 9.54251 12.834 7.33337"
        stroke={strokeBottom}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.166 4.66663H7.16602C4.95688 4.66663 3.16602 6.45749 3.16602 8.66663M10.166 4.66663L8.49935 6.16663M10.166 4.66663L8.49935 3.16663"
        stroke={strokeTop}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
