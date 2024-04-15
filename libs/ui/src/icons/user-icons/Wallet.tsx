import type { SVGProps } from 'react';

export const Wallet = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Wallet</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19.25 8.25v9a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2V6.75"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 13a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.25 8.25h2m-2 0H6.5a1.75 1.75 0 1 1 0-3.5h8.75a2 2 0 0 1 2 2z"
      />
    </svg>
  );
};
