import type { SVGProps } from 'react';

export const Placeholder = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Placeholder</title>
      <rect
        width={12}
        height={12}
        x={2}
        y={2}
        fill="currentColor"
        fillOpacity={0.1}
        rx={6}
      />
      <rect
        width={12}
        height={12}
        x={2}
        y={2}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.114}
        rx={6}
      />
      <path stroke="currentColor" strokeWidth={1.114} d="M14 2 2 14" />
    </svg>
  );
};
