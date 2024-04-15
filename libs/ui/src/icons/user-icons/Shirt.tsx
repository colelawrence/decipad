import type { SVGProps } from 'react';

export const Shirt = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Shirt</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16.25 12v6.25a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1V12m8.5 0v-1.25m0 1.25 3-1.25-4.25-6s-1.592 1.5-3 1.5-3-1.5-3-1.5l-4.25 6 3 1.25m0 0v-1.25"
      />
    </svg>
  );
};
