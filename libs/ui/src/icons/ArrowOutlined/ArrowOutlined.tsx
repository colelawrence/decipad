import { FC } from 'react';
import { cssVar } from '../../primitives';

export const ArrowOutlined = (): ReturnType<FC> => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>ArrowOutlined</title>
    <path
      d="M6 12C6 8.6863 8.6863 6 12 6C15.3137 6 18 8.6863 18 12C18 15.3137 15.3137 18 12 18C8.6863 18 6 15.3137 6 12Z"
      fill="white"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 12H12.625H14.5M14.5 12L12.9375 10M14.5 12L12.9375 14"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);
