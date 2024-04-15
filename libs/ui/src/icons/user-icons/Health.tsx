import type { SVGProps } from 'react';

export const Health = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Health</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18.006 12 12 5.994A4.247 4.247 0 0 0 5.994 12L12 18.006A4.247 4.247 0 0 0 18.006 12M9 15l6-6"
      />
    </svg>
  );
};
