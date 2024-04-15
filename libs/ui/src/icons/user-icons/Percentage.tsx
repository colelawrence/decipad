import type { SVGProps } from 'react';

export const Percentage = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Percentage</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m17.25 6.75-10.5 10.5M16 17.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M8 9.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5"
      />
    </svg>
  );
};
