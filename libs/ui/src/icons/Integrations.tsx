import { FC } from 'react';
import { cssVar } from '../primitives';

export const Integrations = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Integrations</title>
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />

    <path
      d="M12.75 14.75V16.25C12.75 17.3546 13.6454 18.25 14.75 18.25H16.25C17.3546 18.25 18.25 17.3546 18.25 16.25V14.75C18.25 13.6454 17.3546 12.75 16.25 12.75H14.75C13.6454 12.75 12.75 13.6454 12.75 14.75Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.25 15.5H26.75"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.5 13.25L24.5 17.75"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.75 23.75V25.25C12.75 26.3546 13.6454 27.25 14.75 27.25H16.25C17.3546 27.25 18.25 26.3546 18.25 25.25V23.75C18.25 22.6454 17.3546 21.75 16.25 21.75H14.75C13.6454 21.75 12.75 22.6454 12.75 23.75Z"
      fill={cssVar('iconColorMain')}
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.75 23.75V25.25C21.75 26.3546 22.6454 27.25 23.75 27.25H25.25C26.3546 27.25 27.25 26.3546 27.25 25.25V23.75C27.25 22.6454 26.3546 21.75 25.25 21.75H23.75C22.6454 21.75 21.75 22.6454 21.75 23.75Z"
      stroke={cssVar('iconColorHeavy')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
