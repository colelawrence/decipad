import { FC } from 'react';
import { cssVar } from '../../primitives';

export interface CurvedArrowProps {
  direction: 'left' | 'right';
  active: boolean;
}

export const CurvedArrow = ({
  direction,
  active,
}: CurvedArrowProps): ReturnType<FC> => {
  const arrowColor = active
    ? cssVar('currentTextColor')
    : cssVar('weakerTextColor');
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Curved Arrow</title>
      {direction === 'left' ? (
        <>
          <path
            d="M6 9L10.4211 9C14.6068 9 18 12.8683 18 17.64L18 18"
            stroke={arrowColor}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 6L4.5 9L7.5 12"
            stroke={arrowColor}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M16.5 9L12.0789 9C7.89321 9 4.5 12.8683 4.5 17.64L4.5 18"
            stroke={arrowColor}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 6L18 9L15 12"
            stroke={arrowColor}
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
};
