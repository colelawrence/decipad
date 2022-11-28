import { cssVar } from '../../primitives';

export const FolderCross = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Folder Cross</title>
    <path
      d="M6.83268 12.8337H4.49935C3.76297 12.8337 3.16602 12.2367 3.16602 11.5003V5.16699H11.4993C12.2357 5.16699 12.8327 5.76395 12.8327 6.50033V7.50033"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.99935 5.00033L8.37835 3.86186C8.14475 3.43351 7.69575 3.16699 7.20782 3.16699H4.49935C3.76297 3.16699 3.16602 3.76395 3.16602 4.50033V7.33366"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.75977 11.2409C8.75977 11.0377 8.92447 10.873 9.12764 10.873H12.9903C13.1935 10.873 13.3582 11.0377 13.3582 11.2409V13.2642C13.3582 13.6706 13.0288 14 12.6224 14H9.49551C9.08917 14 8.75977 13.6706 8.75977 13.2642V11.2409Z"
      fill={cssVar('highlightColor')}
      stroke={cssVar('currentTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.49489 10.7813V10.7234C9.49489 10.1491 9.46033 9.5089 9.86146 9.09786C10.0902 8.86345 10.4604 8.66602 11.0583 8.66602C11.6563 8.66602 12.0265 8.86345 12.2552 9.09786C12.6563 9.5089 12.6218 10.1491 12.6218 10.7234V10.7813"
      stroke={cssVar('currentTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
