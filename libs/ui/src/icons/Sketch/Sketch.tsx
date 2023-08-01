import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Sketch = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Sketch</title>
    <rect width="40" height="40" rx="8" fill={cssVar('iconBackground')} />
    <g clipPath="url(#clip0_507_34818)">
      <path
        d="M14 18.5L18.4958 14.0029L20.496 17.5034L17.496 20.5034L14 18.5Z"
        fill={cssVar('iconColorMain')}
      />
      <path
        d="M14.0001 29.3209C18.9278 24.8453 24.7663 32.6699 29.6151 26.3759"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.0022 25.1657C23.4539 26.2156 25.3287 26.7123 27.14 24.3612"
        stroke={cssVar('iconColorDefault')}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.3629 10.3839L19.6094 14.6304L21.3666 21.3663L14.6308 19.6091L10.3842 15.3626"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.4878 18.4369C20.4878 18.4369 19.6092 17.8512 18.7306 18.7298C17.852 19.6083 18.4377 20.4869 18.4377 20.4869"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.7522 18.4374L18.438 13.7516"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_507_34818">
        <rect
          width="24"
          height="24"
          fill={cssVar('iconColorMain')}
          transform="translate(8 8)"
        />
      </clipPath>
    </defs>
  </svg>
);
