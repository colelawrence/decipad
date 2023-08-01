import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Bolt: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Bolt</title>
    <path
      d="M10.75 13.25H6.75L13.25 4.75V10.75H17.25L10.75 19.25V13.25Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
