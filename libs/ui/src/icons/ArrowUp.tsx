import type { SVGProps } from 'react';

export const ArrowUp = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ArrowUp</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.4}
        d="M8 13V6"
      />
      <path
        fill="currentColor"
        d="m8.424 3.424 2.552 2.552A.6.6 0 0 1 10.55 7H5.45a.6.6 0 0 1-.425-1.024l2.552-2.552a.6.6 0 0 1 .848 0"
      />
    </svg>
  );
};
