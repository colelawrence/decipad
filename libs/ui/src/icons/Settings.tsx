import type { SVGProps } from 'react';

export const Settings = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Settings</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M3.167 5.334h1.666M8.5 5.334h4.333M3.167 10.667h5M11.834 10.667h1"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M6.667 6.834a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M10 12.167a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
      />
    </svg>
  );
};
