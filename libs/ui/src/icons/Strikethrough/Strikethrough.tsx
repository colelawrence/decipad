import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Strikethrough = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Strikethrough</title>
    <path
      d="M2.5 8.41681H13.3334"
      stroke={cssVar('iconColorDefault')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5863 5.42818V5.2414C12.5863 4.00351 11.5829 3 10.345 3H5.48859C4.2507 3 3.24719 4.00351 3.24719 5.2414V6.17531C3.24719 7.41324 4.2507 8.41671 5.48859 8.41671H10.1582"
      stroke={cssVar('iconColorDefault')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.24719 11.0317V11.4052C3.24719 12.6432 4.2507 13.6466 5.48859 13.6466H10.345C11.5829 13.6466 12.5863 12.6432 12.5863 11.4052V10.2845"
      stroke={cssVar('iconColorDefault')}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
