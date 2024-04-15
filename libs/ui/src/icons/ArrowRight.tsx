import type { SVGProps } from 'react';

export const ArrowRight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ArrowRight</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.4}
        d="M2.75 8h7"
      />
      <path
        fill="currentColor"
        d="m12.826 8.424-2.552 2.552a.6.6 0 0 1-1.024-.425V5.45a.6.6 0 0 1 1.024-.425l2.552 2.552a.6.6 0 0 1 0 .848"
      />
    </svg>
  );
};
