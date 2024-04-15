import type { SVGProps } from 'react';

export const Construction = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Construction</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19.25 5.75H4.75v4.5h3m11.5-4.5v4.5h-3m3-4.5-2.5 4.5m-.5 0v8m0-8H12.2m-4.45 0v8m0-8 2.5-4.5m-2.5 4.5h4.45m2.5-4.5-2.5 4.5"
      />
    </svg>
  );
};
