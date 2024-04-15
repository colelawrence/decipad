import type { SVGProps } from 'react';

export const Route = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Route</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.25 19.25H6.75a2 2 0 0 1-2-2V6.75a2 2 0 0 1 2-2h10.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11 8.25h1a2.25 2.25 0 0 1 0 4.5H9.25a1.5 1.5 0 0 0 0 3h4a2 2 0 0 1 2 2v1.5M7.75 8.25h.5"
      />
    </svg>
  );
};
