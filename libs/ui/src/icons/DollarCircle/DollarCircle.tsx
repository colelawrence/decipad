import { FC } from 'react';
import { cssVar } from '../../primitives';

export const DollarCircle = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Dollar Circle</title>
    <path
      d="M6.99805 1.75671V3.50602"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.51494"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.99805 12.2507L6.99985 14.5"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.51494"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.1368 12.2543H8.31058C8.89051 12.2543 9.44669 12.0239 9.85676 11.6138C10.2668 11.2037 10.4972 10.6476 10.4972 10.0676C10.4972 9.48771 10.2668 8.93153 9.85676 8.52146C9.44669 8.11139 8.89051 7.88101 8.31058 7.88101H5.68663C5.1067 7.88101 4.55052 7.65063 4.14045 7.24056C3.73038 6.83049 3.5 6.27431 3.5 5.69438C3.5 5.11445 3.73038 4.55827 4.14045 4.1482C4.55052 3.73813 5.1067 3.50775 5.68663 3.50775H9.62256"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.51494"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
