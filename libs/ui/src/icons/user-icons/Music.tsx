import type { SVGProps } from 'react';

export const Music = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Music</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 19.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.25 17V6.75a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2V14"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 16.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5"
      />
    </svg>
  );
};
