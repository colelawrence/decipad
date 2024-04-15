import type { SVGProps } from 'react';

export const History = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>History</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M8.283 13.721a5.39 5.39 0 1 0-5.048-3.496"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m1.635 9.812 1.41.658a.444.444 0 0 0 .59-.215l.658-1.41M8.273 6.82v2.5h2"
      />
    </svg>
  );
};
