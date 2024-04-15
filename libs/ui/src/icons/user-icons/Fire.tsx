import type { SVGProps } from 'react';

export const Fire = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Fire</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18.25 14c0 4-2.75 5.25-6.25 5.25-4 0-6.25-2.85-6.25-5.25S7 9.417 8 8.75c0 2.8 2.667 4.583 4 4.5-2.4-3.6-.333-7.583 1-8.5 0 4.5 5.25 5.25 5.25 9.25"
      />
    </svg>
  );
};
