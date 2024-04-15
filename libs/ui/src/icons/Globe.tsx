import type { SVGProps } from 'react';

export const Globe = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Globe</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 13.25a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.625 8c0 3.259-1.621 5.25-2.625 5.25S5.375 11.259 5.375 8 6.996 2.75 8 2.75 10.625 4.741 10.625 8"
      />
      <path fill="currentColor" fillOpacity={0.1} d="M2.75 8h10.5" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.75 8h10.5"
      />
    </svg>
  );
};
