import type { SVGProps } from 'react';

export const AlignArrowRight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>AlignArrowRight</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M3.167 3.167v9.666M5.834 8h7M10.5 5.833 12.833 8 10.5 10.167"
      />
    </svg>
  );
};
