import type { SVGProps } from 'react';

export const Percentage = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Percentage</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m12 4-8 8"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.048 12a.952.952 0 1 0 0-1.905.952.952 0 0 0 0 1.905M4.952 5.905a.952.952 0 1 0 0-1.905.952.952 0 0 0 0 1.905"
      />
    </svg>
  );
};
