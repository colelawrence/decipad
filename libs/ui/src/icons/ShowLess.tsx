import type { SVGProps } from 'react';

export const ShowLess = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ShowLess</title>
      <rect
        width={10.8}
        height={10.8}
        x={2.6}
        y={2.6}
        stroke="currentColor"
        strokeWidth={1.2}
        rx={2.4}
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M5.231 8h5.538"
      />
    </svg>
  );
};
