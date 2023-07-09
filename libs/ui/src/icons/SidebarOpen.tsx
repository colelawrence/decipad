import { FC } from 'react';
import { cssVar } from '../primitives';

export const SidebarOpen = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Sidebar Open</title>
    <path
      d="M4.37929 3L11.6207 3C12.3825 3 13 3.61754 13 4.37931L13 11.6207C13 12.3825 12.3825 13 11.6207 13L4.37929 13C3.61753 13 3 12.3825 3 11.6207L3 4.37931C3 3.61754 3.61753 3 4.37929 3Z"
      fill="transparent"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M10.5 5.16659L10.5 10.8333"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);
