import type { SVGProps } from 'react';

export const AlignArrowDown = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>AlignArrowDown</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M3.167 3.167h9.666M8 12.833v-7M10.167 10.5 8 12.833 5.834 10.5"
      />
    </svg>
  );
};
