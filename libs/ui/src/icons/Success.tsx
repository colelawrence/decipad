import type { SVGProps } from 'react';

export const Success = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Success</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m6 8.667.386.821a.889.889 0 0 0 1.575.065L10 6"
      />
    </svg>
  );
};
