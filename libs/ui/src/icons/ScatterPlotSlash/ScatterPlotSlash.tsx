import { FC } from 'react';
import { cssVar } from '../../primitives';

export const ScatterPlotSlash = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="6" fill={cssVar('slashColorLight')} />
    <path
      d="M11.75 11.75V28.25H28.25"
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.125 22.75C24.8844 22.75 25.5 22.1344 25.5 21.375C25.5 20.6156 24.8844 20 24.125 20C23.3656 20 22.75 20.6156 22.75 21.375C22.75 22.1344 23.3656 22.75 24.125 22.75Z"
      fill={cssVar('slashColorLight')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 20C20.7594 20 21.375 19.3844 21.375 18.625C21.375 17.8656 20.7594 17.25 20 17.25C19.2406 17.25 18.625 17.8656 18.625 18.625C18.625 19.3844 19.2406 20 20 20Z"
      fill={cssVar('slashColorLight')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.875 24.125C16.6344 24.125 17.25 23.5094 17.25 22.75C17.25 21.9906 16.6344 21.375 15.875 21.375C15.1156 21.375 14.5 21.9906 14.5 22.75C14.5 23.5094 15.1156 24.125 15.875 24.125Z"
      fill={cssVar('slashColorLight')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26.375 17.25C27.1344 17.25 27.75 16.6344 27.75 15.875C27.75 15.1156 27.1344 14.5 26.375 14.5C25.6156 14.5 25 15.1156 25 15.875C25 16.6344 25.6156 17.25 26.375 17.25Z"
      fill={cssVar('slashColorLight')}
      stroke={cssVar('slashColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
