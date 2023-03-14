import { FC } from 'react';
import { orange100, orange200, orange500 } from '../../primitives';

export const BarChartSlash = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="6" fill={orange100.rgb} />
    <path
      d="M13.7 15.5H12.8C11.8059 15.5 11 16.1268 11 16.9V24.6C11 25.3732 11.8059 26 12.8 26H13.7C14.6941 26 15.5 25.3732 15.5 24.6V16.9C15.5 16.1268 14.6941 15.5 13.7 15.5Z"
      fill={orange200.rgb}
      stroke={orange500.rgb}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.5994 11H19.6994C18.7053 11 17.8994 11.584 17.8994 12.3043V24.6957C17.8994 25.416 18.7053 26 19.6994 26H20.5994C21.5936 26 22.3994 25.416 22.3994 24.6957V12.3043C22.3994 11.584 21.5936 11 20.5994 11Z"
      fill={orange200.rgb}
      stroke={orange500.rgb}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 29H29"
      stroke={orange500.rgb}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.2 15.5H26.3C25.3059 15.5 24.5 16.1268 24.5 16.9V24.6C24.5 25.3732 25.3059 26 26.3 26H27.2C28.1941 26 29 25.3732 29 24.6V16.9C29 16.1268 28.1941 15.5 27.2 15.5Z"
      fill="white"
      stroke="#FF8C19"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
