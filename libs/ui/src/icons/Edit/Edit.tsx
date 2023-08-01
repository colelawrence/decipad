import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Edit: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Edit</title>
    <path
      d="M13.0066 8.5C13.9829 9.47632 14.5303 10.0237 15.5066 11"
      stroke={cssVar('iconColorDefault')}
      strokeWidth="1.3125"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 17.0067L9.93459 16.3162L16.8044 9.44634C17.0741 9.17668 17.0741 8.73949 16.8044 8.46983L15.5368 7.20224C15.2671 6.93259 14.83 6.93259 14.5603 7.20224L7.69049 14.0721L7 17.0067Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.08752"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
