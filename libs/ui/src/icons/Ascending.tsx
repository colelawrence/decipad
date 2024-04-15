import type { SVGProps } from 'react';

export const Ascending = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Ascending</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M8.645 6.078 10.922 3.8 13.2 6.077M10.922 9.267V3.8M3.177 8.355h4.1M3.177 4.71h3.19M3.177 12h7.745"
      />
    </svg>
  );
};
