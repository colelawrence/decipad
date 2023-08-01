import { FC } from 'react';
import { cssVar } from '../../primitives';

export interface LightBulbProps {
  background?: boolean;
}

export const LightBulb: FC<LightBulbProps> = ({ background }) => {
  const fill = background ? cssVar('backgroundDefault') : 'transparent';
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>LightBulb</title>
      <path
        d="M10.2 16.75H14.2M6.94995 10C6.94995 7.5 8.69995 4.75 12.2 4.75C15.7 4.75 17.45 7.5 17.45 10C17.45 14 14.45 14.5 14.45 16V18.2505C14.45 18.8028 14.0022 19.25 13.45 19.25H10.95C10.3977 19.25 9.94995 18.8028 9.94995 18.2505V16C9.94995 14.5 6.94995 14 6.94995 10Z"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill}
      />
    </svg>
  );
};
