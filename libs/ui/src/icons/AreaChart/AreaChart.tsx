import { FC } from 'react';
import { cssVar } from '../../primitives';

export const AreaChart = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Area Chart</title>
    <path
      d="M2 2V14H14"
      stroke={cssVar('strongTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.81818 11.9975H12.1818C12.6344 11.9975 13 11.6382 13 11.1935V9.48006C13 9.28912 12.931 9.1032 12.8031 8.95748L11.1207 7.02795C10.8114 6.67119 10.2591 6.65109 9.92159 6.98273L9.38466 7.51033C9.12898 7.76157 8.70966 7.74147 8.47955 7.47013L7.47727 6.2893C7.15511 5.90993 6.56449 5.90239 6.2321 6.27423L4.20199 8.55549C4.07159 8.70121 4 8.88964 4 9.08561V11.196C4 11.6407 4.36562 12 4.81818 12V11.9975Z"
      fill={cssVar('iconBackgroundColor')}
    />
    <path
      d="M4.5 9L6.22265 6.41602C6.39592 6.15612 6.68763 6 7 6V6V6C7.31476 6 7.61115 6.14819 7.8 6.4L8.54482 7.39309C8.78506 7.71341 9.25331 7.74669 9.53644 7.46356L10.3506 6.64937C10.4463 6.55373 10.576 6.5 10.7112 6.5V6.5C10.8904 6.5 11.0564 6.59399 11.1486 6.7476L12.5 9"
      stroke={cssVar('strongTextColor')}
      strokeLinecap="round"
    />
  </svg>
);
