import { FC } from 'react';
import { cssVar } from '../../primitives';

export const DrawingPin: FC<{ isOutline?: boolean }> = ({ isOutline }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>DrawingPin</title>
    {isOutline ? (
      <path
        d="m12.599 7.883.753-2.261 4.9 4.899-2.262.754-3.203 4.71-.188 1.696-6.407-6.406 1.696-.189 4.71-3.203ZM9.207 14.666 4.873 19"
        stroke={cssVar('currentTextColor')}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <>
        <path
          d="m12.599 7.883.753-2.261 4.9 4.899-2.262.754-3.203 4.71-.188 1.696-6.407-6.406 1.696-.189 4.71-3.203Z"
          fill={cssVar('currentTextColor')}
          stroke={cssVar('currentTextColor')}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.207 14.666 4.873 19"
          stroke={cssVar('currentTextColor')}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);
