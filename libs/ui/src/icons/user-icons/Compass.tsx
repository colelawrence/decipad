import type { SVGProps } from 'react';

export const Compass = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Compass</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19.25 12a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m10.409 10.409 4.84-1.659-1.658 4.841L8.75 15.25z"
      />
    </svg>
  );
};
