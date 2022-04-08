import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Announcement = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Announcement</title>
      <path
        d="M18.6458 10.5833C18.6458 13.1985 17.3625 15.6146 16.125 15.6146C14.8875 15.6146 13.6042 13.1985 13.6042 10.5833C13.6042 7.96809 14.8875 5.55208 16.125 5.55208C17.3625 5.55208 18.6458 7.96809 18.6458 10.5833Z"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
      />
      <path
        d="M16.125 15.6146C16.125 15.6146 8.33332 13.9375 7.41666 13.6979C6.49999 13.4583 5.35416 12.2022 5.35416 10.5833C5.35416 8.96438 6.49999 7.70833 7.41666 7.46874C8.33332 7.22916 16.125 5.55208 16.125 5.55208"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
      />
      <path
        d="M7.1875 13.9375V17.5312C7.1875 18.5898 8.00831 19.4479 9.02083 19.4479H9.47917C10.4917 19.4479 11.3125 18.5898 11.3125 17.5312V14.8958"
        stroke={cssVar('currentTextColor')}
        strokeWidth="1.5"
      />
    </svg>
  );
};
