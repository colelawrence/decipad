import { FC } from 'react';
import { teal100, teal200, teal500 } from '../../primitives';

export const Dropdown: FC = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>dropdown</title>
    <rect width="40" height="40" rx="6" fill={teal100.rgb} />
    <rect
      x="8.65"
      y="10.65"
      width="22.7"
      height="7.7"
      rx="2.35"
      fill="white"
      stroke={teal500.rgb}
      strokeWidth="1.3"
    />
    <path
      d="M22.65 10.65H29C30.2979 10.65 31.35 11.7021 31.35 13V16C31.35 17.2979 30.2979 18.35 29 18.35H22.65V10.65Z"
      fill="white"
      stroke={teal500.rgb}
      strokeWidth="1.3"
    />
    <rect x="11" y="14" width="8" height="1.3" rx="0.65" fill={teal100.rgb} />
    <rect x="11" y="23" width="18" height="1.3" rx="0.65" fill={teal500.rgb} />
    <rect x="11" y="28" width="18" height="1.3" rx="0.65" fill={teal200.rgb} />
    <path
      d="M26 15L26.8586 14.1414C26.9367 14.0633 27.0633 14.0633 27.1414 14.1414L28 15"
      stroke={teal500.rgb}
      strokeLinecap="round"
    />
  </svg>
);
