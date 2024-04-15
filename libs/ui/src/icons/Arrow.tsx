import type { SVGProps } from 'react';

export const Arrow = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Arrow</title>
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
        d="M5.5 8h5m0 0L8.938 6M10.5 8l-1.562 2"
      />
    </svg>
  );
};
