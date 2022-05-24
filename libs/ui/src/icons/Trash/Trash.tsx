import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Trash = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Trash</title>
    <path
      d="M3.50031 4.35884L4.22121 12.6493C4.29824 13.5351 5.03976 14.2149 5.92887 14.2149H10.0708C10.9599 14.2149 11.7014 13.5351 11.7784 12.6493L12.4993 4.35884"
      fill={cssVar('iconBackgroundColor')}
    />
    <path
      d="M3.50031 4.35884L4.22121 12.6493C4.29824 13.5351 5.03976 14.2149 5.92887 14.2149H10.0708C10.9599 14.2149 11.7014 13.5351 11.7784 12.6493L12.4993 4.35884"
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.28557"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.07147 4.14458V3.50179C6.07147 2.55512 6.83887 1.78769 7.78557 1.78769H8.2141C9.16079 1.78769 9.9282 2.55512 9.9282 3.50179V4.14458"
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.28557"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.00128 4.35884H14"
      stroke={cssVar('weakTextColor')}
      strokeWidth="1.28557"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
