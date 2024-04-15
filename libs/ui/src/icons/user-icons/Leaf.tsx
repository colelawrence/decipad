import type { SVGProps } from 'react';

export const Leaf = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Leaf</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.75 13c0-5.6 14.5-8.25 14.5-8.25s-1 14.5-7.25 14.5C8 19.25 4.75 17 4.75 13"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.75 19.25S8 14 12.25 11.75"
      />
    </svg>
  );
};
