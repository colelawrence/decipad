import type { SVGProps } from 'react';

export const Flower = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Flower</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.25 15.5c0-.464-.115-.9-.317-1.284a2.75 2.75 0 0 0 0-5.432A2.75 2.75 0 1 0 12 6.353a2.75 2.75 0 1 0-4.933 2.43 2.75 2.75 0 0 0 0 5.433A2.75 2.75 0 1 0 12 16.647a2.75 2.75 0 0 0 5.25-1.147"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.25 11.75a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0"
      />
    </svg>
  );
};
