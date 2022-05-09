import { cssVar } from '../../primitives';

export const Show = (): ReturnType<React.FC> => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Show</title>
    <path
      d="M12.9999 8.31031C12.9999 8.99996 11.793 12.6206 7.99996 12.6206C4.20689 12.6206 3 8.99996 3 8.31031C3 7.62066 4.20689 4 7.99996 4C11.793 4 12.9999 7.62066 12.9999 8.31031Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.03447"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.99998 9.86197C8.85697 9.86197 9.5517 9.16724 9.5517 8.31026C9.5517 7.45327 8.85697 6.75854 7.99998 6.75854C7.143 6.75854 6.44827 7.45327 6.44827 8.31026C6.44827 9.16724 7.143 9.86197 7.99998 9.86197Z"
      stroke={cssVar('currentTextColor')}
      strokeWidth="1.03447"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
