import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Transpose: FC = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Transpose</title>
    <path
      d="M9 14H10.4706C12.4198 14 14 12.4198 14 10.4706V9"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M8.80005 13L7.80005 14L8.80005 15"
      stroke={cssVar('currentTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M15 8.7L14 7.7L13 8.7"
      stroke={cssVar('currentTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M7.41379 5H12.5862C12.8147 5 13 4.7558 13 4.45457V2.54543C13 2.2442 12.8147 2 12.5862 2H7.41379C7.18526 2 7 2.2442 7 2.54543V4.45457C7 4.7558 7.18526 5 7.41379 5Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M2 7.41379L2 12.5862C2 12.8147 2.2442 13 2.54543 13L4.45457 13C4.7558 13 5 12.8147 5 12.5862L5 7.41379C5 7.18526 4.7558 7 4.45457 7L2.54543 7C2.2442 7 2 7.18526 2 7.41379Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
