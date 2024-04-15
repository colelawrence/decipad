import type { SVGProps } from 'react';

export const ArrowVertical = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ArrowVertical</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.4}
        d="M7.5 5v5"
      />
      <path
        fill="currentColor"
        d="m7.924 2.424 2.552 2.552A.6.6 0 0 1 10.05 6H4.95a.6.6 0 0 1-.425-1.024l2.552-2.552a.6.6 0 0 1 .848 0M7.076 13.576l-2.552-2.552A.6.6 0 0 1 4.95 10h5.103a.6.6 0 0 1 .424 1.024l-2.552 2.552a.6.6 0 0 1-.848 0"
      />
    </svg>
  );
};
