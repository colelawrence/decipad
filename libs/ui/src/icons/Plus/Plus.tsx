import { FC } from 'react';
import { cssVar, offBlack } from '../../primitives';

interface PlusProps {
  readonly variant?: 'black';
}

export const Plus: FC<PlusProps> = ({ variant }) => {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Plus</title>
      <path
        d="M10 6.5V14.5"
        stroke={variant ? offBlack.hex : cssVar('iconColorHeavy')}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 10.5H14"
        stroke={variant ? offBlack.hex : cssVar('iconColorHeavy')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
