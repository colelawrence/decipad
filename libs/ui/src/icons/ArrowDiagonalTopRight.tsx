import type { SVGProps } from 'react';

export const ArrowDiagonalTopRight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ArrowDiagonalTopRight</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.4}
        d="m4.298 11.952 5-5"
      />
      <path
        fill="currentColor"
        d="M12 4.962V8.57a.6.6 0 0 1-1.024.425L7.367 5.386a.6.6 0 0 1 .425-1.024H11.4a.6.6 0 0 1 .6.6"
      />
    </svg>
  );
};
