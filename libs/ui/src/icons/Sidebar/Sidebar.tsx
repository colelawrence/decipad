import * as React from 'react';
import { cssVar } from '../../primitives';

export const Sidebar = (): ReturnType<React.FC> => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none">
    <path
      fill={cssVar('iconBackgroundColor')}
      stroke={cssVar('normalTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.431 19.5H6.57A2.069 2.069 0 0 1 4.5 17.431V6.569c0-1.143.926-2.069 2.069-2.069H17.43c1.143 0 2.069.926 2.069 2.069v10.862a2.069 2.069 0 0 1-2.069 2.069Z"
    />
    <path
      stroke={cssVar('normalTextColor')}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 16.25v-8.5"
    />
  </svg>
);
