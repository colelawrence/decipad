import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Move: FC = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Transpose</title>
    <path
      d="M5.50008 7.50001L3.16675 5.33334L5.50008 3.16667"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M3.16675 5.33333H10.1667"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M10.5 8.5L12.8333 10.6667L10.5 12.8333"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M12.8333 10.6667H5.83325"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
