import type { SVGProps } from 'react';

export const Cluster = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Cluster</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M6.5 6.5 8 5l1.5 1.5M9.5 9.5 8 11 6.5 9.5"
      />
    </svg>
  );
};
