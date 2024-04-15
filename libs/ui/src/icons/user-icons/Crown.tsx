import type { SVGProps } from 'react';

export const Crown = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Crown</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.75 16.25V5.75L9 11.25l3-5.5 3 5.5 4.25-5.5v10.5s-1.25 2-7.25 2-7.25-2-7.25-2"
      />
    </svg>
  );
};
