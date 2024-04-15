import type { SVGProps } from 'react';

export const PointChart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>PointChart</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 2v12h12"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.8}
        d="M11 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2M8 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2M5 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2M13 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
      />
    </svg>
  );
};
