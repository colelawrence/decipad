import type { SVGProps } from 'react';

export const Download = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Download</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M8 1.75v6.5"
      />
      <path
        fill="currentColor"
        d="M7.576 9.826 5.024 7.274A.6.6 0 0 1 5.45 6.25h5.103a.6.6 0 0 1 .424 1.024L8.424 9.826a.6.6 0 0 1-.848 0"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M3 9v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9"
      />
    </svg>
  );
};
