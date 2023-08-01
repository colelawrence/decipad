import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Bell = (): ReturnType<FC> => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Bell</title>

    <path
      d="M15.6676 12.144C15.6367 12.0778 15.6207 12.0056 15.6207 11.9326V10.6522C15.6207 8.63513 13.9997 7 12 7C10.0004 7 8.37931 8.63514 8.37931 10.6522V11.9326C8.37931 12.0056 8.36331 12.0778 8.33243 12.144L7.33189 14.2886C7.17724 14.6201 7.41922 15 7.785 15H16.215C16.5808 15 16.8228 14.6201 16.6681 14.2886L15.6676 12.144Z"
      fill={cssVar('iconBackground')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 15C10 15 10 17 12 17C14 17 14 15 14 15"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
