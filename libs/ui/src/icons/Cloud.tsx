import type { SVGProps } from 'react';

export const Cloud = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Cloud</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3.167 9.333c0 1.197.97 2.167 2.166 2.167h5.334a2.167 2.167 0 0 0 .162-4.327 2.833 2.833 0 0 0-5.658 0 2.167 2.167 0 0 0-2.004 2.16"
      />
    </svg>
  );
};
