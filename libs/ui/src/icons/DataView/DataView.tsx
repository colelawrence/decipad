import { FC } from 'react';
import { cssVar } from '../../primitives';

export const DataView = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>SlashDataView</title>
    <rect width="40" height="40" rx="8" fill={cssVar('slashColorLight')} />

    <path
      d="M22.7998 11.25H15.7998C14.3997 11.25 13.6996 11.25 13.1648 11.5225C12.6944 11.7622 12.312 12.1446 12.0723 12.615C11.7998 13.1498 11.7998 13.8499 11.7998 15.25V19.75C11.7998 21.1501 11.7998 21.8502 12.0723 22.385C12.312 22.8554 12.6944 23.2378 13.1648 23.4775C13.6996 23.75 14.3997 23.75 15.7998 23.75H22.7998C24.1999 23.75 24.9 23.75 25.4348 23.4775C25.9052 23.2378 26.2876 22.8554 26.5273 22.385C26.7998 21.8502 26.7998 21.1501 26.7998 19.75V15.25C26.7998 13.8499 26.7998 13.1498 26.5273 12.615C26.2876 12.1446 25.9052 11.7622 25.4348 11.5225C24.9 11.25 24.1999 11.25 22.7998 11.25Z"
      fill={cssVar('backgroundColor')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M16.7998 11.25V23.75"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M26.7998 17.5H11.7998"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M21.7998 11.25V23.75"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M29.365 20.1342L21.6611 24.0642C21.3162 24.2402 21.3976 24.7546 21.7799 24.8155L25.1815 25.3576C25.3146 25.3788 25.428 25.4655 25.4833 25.5884L27.2133 29.4297C27.3711 29.7801 27.8842 29.728 27.9683 29.353L29.9371 20.5781C30.0112 20.2476 29.6667 19.9803 29.365 20.1342Z"
      fill={cssVar('backgroundColor')}
      stroke={cssVar('slashColorNormal')}
      strokeWidth="1.3"
    />
  </svg>
);
