import { FC } from 'react';
import { cssVar } from '../../primitives';

interface CaretProps {
  readonly type: 'expand' | 'collapse';
}

export const Caret = ({ type }: CaretProps): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>{type}</title>
      <path
        d={
          {
            expand: 'M9.5 1.25L5 5.75L0.5 1.25',
            collapse: 'M0.5 5.75L5 1.25L9.5 5.75',
          }[type]
        }
        stroke={cssVar('strongTextColor')}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
};
