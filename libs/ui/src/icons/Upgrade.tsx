import type { SVGProps } from 'react';

export const Upgrade = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Upgrade</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.3}
        d="M8 10.5v-5m0 0L6 7.063M8 5.5l2 1.563"
      />
    </svg>
  );
};
