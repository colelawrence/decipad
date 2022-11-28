import { FC } from 'react';
import { teal100, teal500 } from '../../primitives';

export const GenericCursorAdd = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23 11V19"
      stroke={teal500.rgb}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M19 15H27"
      stroke={teal500.rgb}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.2582 18.543L4.87888 24.858C4.53396 25.034 4.61532 25.5484 4.9977 25.6093L10.7612 26.5278C10.8942 26.549 11.0076 26.6357 11.0629 26.7585L13.9236 33.1105C14.0815 33.4609 14.5945 33.4088 14.6786 33.0338L17.8302 18.9869C17.9044 18.6564 17.5599 18.3891 17.2582 18.543Z"
      fill={teal100.rgb}
      stroke={teal500.rgb}
      strokeWidth="1.3"
    />
  </svg>
);
