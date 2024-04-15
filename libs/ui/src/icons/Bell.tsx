import type { SVGProps } from 'react';

export const Bell = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Bell</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M11.668 8.144a.5.5 0 0 1-.047-.211v-1.28C11.62 4.634 10 3 8 3S4.38 4.635 4.38 6.652v1.28a.5.5 0 0 1-.048.212l-1 2.145a.5.5 0 0 0 .453.711h8.43a.5.5 0 0 0 .453-.711l-1-2.145"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M6 11s0 2 2 2 2-2 2-2"
      />
    </svg>
  );
};
