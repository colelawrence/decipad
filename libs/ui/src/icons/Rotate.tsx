import type { SVGProps } from 'react';

export const Rotate = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Rotate</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m7.5 9.833-1.666 1.5m0 0 1.666 1.5m-1.666-1.5h3a4 4 0 0 0 4-4M10.167 4.667h-3a4 4 0 0 0-4 4m7-4L8.5 6.167m1.666-1.5L8.5 3.167"
      />
    </svg>
  );
};
