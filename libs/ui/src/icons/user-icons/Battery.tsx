import type { SVGProps } from 'react';

export const Battery = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Battery</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.75 8.75a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2h-8.5a2 2 0 0 1-2-2zM7.75 9.75v4.5M11 9.75v4.5M14.25 9.75v4.5M17.75 10.75H18a1.25 1.25 0 1 1 0 2.5h-.25"
      />
    </svg>
  );
};
