import type { SVGProps } from 'react';

export const AlignArrowUp = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>AlignArrowUp</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M3.167 12.833h9.666M8 10.167v-7M10.167 5.5 8 3.167 5.834 5.5"
      />
    </svg>
  );
};
