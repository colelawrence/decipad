import type { SVGProps } from 'react';

export const PieChart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>PieChart</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M13.526 10.336a6.002 6.002 0 0 1-7.254 3.41 6 6 0 0 1-2.969-9.482A6 6 0 0 1 5.6 2.498M14 8.001A6.003 6.003 0 0 0 8 2v6.001h6"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M14 8.001A6.003 6.003 0 0 0 8 2v6.001h6"
      />
    </svg>
  );
};
