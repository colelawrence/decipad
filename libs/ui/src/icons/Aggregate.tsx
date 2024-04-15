import type { SVGProps } from 'react';

export const Aggregate = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Aggregate</title>
      <rect
        width={3}
        height={10}
        x={10}
        y={3}
        fill="currentColor"
        fillOpacity={0.1}
        rx={1}
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M4.5 4.833V4.5c0-.736.597-1.333 1.334-1.333H11.5c.736 0 1.334.597 1.334 1.333v7c0 .736-.598 1.333-1.334 1.333H8M9.833 3.333v9.334M4.5 8v4M6.5 10h-4"
      />
    </svg>
  );
};
