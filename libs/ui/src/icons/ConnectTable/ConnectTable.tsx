import { FC } from 'react';
import { cssVar } from '../../primitives';

export const ConnectTable = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Connect Table</title>
    <rect width={40} height={40} rx={8} fill={cssVar('iconBackground')} />

    <g clipPath="url(#clip0_507_34792)">
      <path
        d="M27.25 15C27.25 16.1046 23.866 17.25 20 17.25C16.134 17.25 12.75 16.1046 12.75 15C12.75 13.8954 16.134 12.75 20 12.75C23.866 12.75 27.25 13.8954 27.25 15Z"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.25 22.25C16.384 22.25 12.75 21.1046 12.75 20"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27.25 20.25V15"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.25 27.25C16.384 27.25 12.75 26.1046 12.75 25V15"
        stroke={cssVar('iconColorHeavy')}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.2173 22.2662L23.788 29.332C23.8192 29.7179 24.3258 29.8389 24.5279 29.5086L25.9549 27.1767C26.0252 27.0618 26.1486 26.99 26.2833 26.9857L29.6763 26.877C30.0604 26.8647 30.2078 26.3705 29.8932 26.1497L23.8458 21.9066C23.5685 21.712 23.1901 21.9286 23.2173 22.2662Z"
        fill={cssVar('iconColorMain')}
        stroke={cssVar('iconColorDefault')}
        strokeWidth="1.5"
      />
    </g>
    <defs>
      <clipPath id="clip0_507_34792">
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
