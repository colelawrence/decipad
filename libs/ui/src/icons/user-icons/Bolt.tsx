import type { SVGProps } from 'react';

export const Bolt = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Bolt</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.75 13.25h-4l6.5-8.5v6h4l-6.5 8.5z"
      />
    </svg>
  );
};
