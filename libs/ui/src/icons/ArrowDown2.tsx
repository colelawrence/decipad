import type { SVGProps } from 'react';

export const ArrowDown2 = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ArrowDown2</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M 11.5 9.166 L 8 12.833 L 4.5 9.166 M 8 3.167 L 8 12.667"
      />
    </svg>
  );
};
