import type { SVGProps } from 'react';

export const ShoppingCart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>ShoppingCart</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m7.75 7.75-.75-3H4.75m3 3h11.5l-1.637 6.958a2 2 0 0 1-1.947 1.542H11.54a2 2 0 0 1-1.934-1.488z"
      />
      <path
        fill="currentColor"
        d="M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
      />
    </svg>
  );
};
