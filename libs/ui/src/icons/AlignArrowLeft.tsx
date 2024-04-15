import type { SVGProps } from 'react';

export const AlignArrowLeft = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>AlignArrowLeft</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M12.834 3.167v9.666M3.167 8h7M5.5 5.833 3.167 8 5.5 10.167"
      />
    </svg>
  );
};
