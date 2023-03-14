import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Plot = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Plot</title>
    <path
      d="M1 13.8452H15"
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.35449 9.05809V13.6645C2.35449 13.7643 2.43537 13.8452 2.53514 13.8452H5.78675C5.88652 13.8452 5.96739 13.7643 5.96739 13.6645V9.05809C5.96739 8.95832 5.88652 8.87744 5.78675 8.87744H2.53514C2.43537 8.87744 2.35449 8.95832 2.35449 9.05809Z"
      fill={cssVar('iconBackgroundColor')}
      stroke={cssVar('strongTextColor')}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M9.58068 5.89671V13.6644C9.58068 13.7642 9.4998 13.8451 9.40003 13.8451H6.14842C6.04865 13.8451 5.96777 13.7642 5.96777 13.6644V5.89671C5.96777 5.79694 6.04865 5.71606 6.14842 5.71606H9.40003C9.4998 5.71606 9.58068 5.79694 9.58068 5.89671Z"
      fill={cssVar('iconBackgroundColor')}
      stroke={cssVar('strongTextColor')}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    <path
      d="M13.6456 2.73558V13.6646C13.6456 13.7644 13.5647 13.8453 13.4649 13.8453H9.7617C9.66193 13.8453 9.58105 13.7644 9.58105 13.6646V2.73558C9.58105 2.63581 9.66193 2.55493 9.7617 2.55493H13.4649C13.5647 2.55493 13.6456 2.63581 13.6456 2.73558Z"
      stroke={cssVar('strongTextColor')}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);
