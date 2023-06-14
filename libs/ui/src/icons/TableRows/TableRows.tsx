import { FC } from 'react';
import { cssVar } from '../../primitives';

export const TableRows = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 11.5V5.5C3 4.39543 3.89543 3.5 5 3.5H11C12.1046 3.5 13 4.39543 13 5.5V11.5C13 12.6046 12.1046 13.5 11 13.5H5C3.89543 13.5 3 12.6046 3 11.5Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
    />
    <path
      d="M12.3333 6.80005L3 6.80005"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.8333 10.2L3.5 10.2"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
