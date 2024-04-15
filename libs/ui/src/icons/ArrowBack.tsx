import type { SVGProps } from 'react';

export const ArrowBack = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ArrowBack</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.4}
        d="M13.25 8h-7"
      />
      <path
        fill="currentColor"
        d="m3.174 7.576 2.552-2.552a.6.6 0 0 1 1.024.425v5.103a.6.6 0 0 1-1.024.424L3.174 8.424a.6.6 0 0 1 0-.848"
      />
    </svg>
  );
};
