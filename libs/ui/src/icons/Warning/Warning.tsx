import { FC } from 'react';
import { cssVar } from '../../primitives';

export const Warning = (): ReturnType<FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Warning</title>

    <path
      d="M2.16507 11.6041L6.52228 2.91366C7.13318 1.69519 8.87242 1.69552 9.48291 2.9142L13.8361 11.6047C14.3876 12.7056 13.5871 14.002 12.3557 14.002H3.64524C2.41356 14.002 1.61303 12.7051 2.16507 11.6041Z"
      fill={cssVar('iconBackgroundColor')}
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M7.99988 6.34399V7.99978Z" fill={cssVar('iconBackgroundColor')} />

    <path
      d="M7.99988 6.34399V7.99978"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M8.41384 11.3114C8.41384 11.54 8.22851 11.7253 7.99989 11.7253C7.77127 11.7253 7.58594 11.54 7.58594 11.3114C7.58594 11.0827 7.77127 10.8974 7.99989 10.8974C8.22851 10.8974 8.41384 11.0827 8.41384 11.3114Z"
      fill={cssVar('iconBackgroundColor')}
      stroke={cssVar('currentTextColor')}
      strokeWidth="0.8"
    />
  </svg>
);
