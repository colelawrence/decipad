import type { SVGProps } from 'react';

export const ArrowDown = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ArrowDown</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.4}
        d="M7 3v7"
      />
      <path
        fill="currentColor"
        d="m6.576 12.576-2.552-2.552A.6.6 0 0 1 4.45 9H9.55a.6.6 0 0 1 .425 1.024l-2.552 2.552a.6.6 0 0 1-.848 0"
      />
    </svg>
  );
};
