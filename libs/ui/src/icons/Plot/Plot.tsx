import { FC } from 'react';
import { cssVar, grey300 } from '../../primitives';

export const Plot = (): ReturnType<FC> => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Plot</title>
    <path
      d="M10.375 28.0371H29.625"
      stroke={cssVar('normalTextColor')}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.238 21.4549V27.7888C12.238 27.926 12.3492 28.0372 12.4864 28.0372H16.9574C17.0946 28.0372 17.2058 27.926 17.2058 27.7888V21.4549C17.2058 21.3177 17.0946 21.2065 16.9574 21.2065H12.4864C12.3492 21.2065 12.238 21.3177 12.238 21.4549Z"
      fill={grey300.rgb}
      stroke={cssVar('strongTextColor')}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M22.1733 17.1083V27.7889C22.1733 27.9261 22.0621 28.0373 21.9249 28.0373H17.454C17.3168 28.0373 17.2056 27.9261 17.2056 27.7889V17.1083C17.2056 16.9711 17.3168 16.8599 17.454 16.8599H21.9249C22.0621 16.8599 22.1733 16.9711 22.1733 17.1083Z"
      fill={grey300.rgb}
      stroke={cssVar('strongTextColor')}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M27.762 12.7611V27.7885C27.762 27.9257 27.6508 28.0369 27.5137 28.0369H22.4217C22.2845 28.0369 22.1733 27.9257 22.1733 27.7885V12.7611C22.1733 12.6239 22.2845 12.5127 22.4217 12.5127H27.5137C27.6508 12.5127 27.762 12.6239 27.762 12.7611Z"
      fill="white"
      stroke={cssVar('strongTextColor')}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);
