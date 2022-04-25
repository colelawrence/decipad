import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Bold = (): ReturnType<FC> => {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Bold</title>
      <path
        d="M4 2.66669H9.33333C10.0406 2.66669 10.7189 2.94764 11.219 3.44774C11.719 3.94783 12 4.62611 12 5.33335C12 6.0406 11.719 6.71888 11.219 7.21897C10.7189 7.71907 10.0406 8.00002 9.33333 8.00002H4V2.66669Z"
        stroke={cssVar('weakTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 8H10C10.7072 8 11.3855 8.28095 11.8856 8.78105C12.3857 9.28115 12.6667 9.95942 12.6667 10.6667C12.6667 11.3739 12.3857 12.0522 11.8856 12.5523C11.3855 13.0524 10.7072 13.3333 10 13.3333H4V8Z"
        stroke={cssVar('weakTextColor')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
