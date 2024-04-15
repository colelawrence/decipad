import type { SVGProps } from 'react';

export const Templates = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Templates</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M10.894 13.446v0a1 1 0 0 0 1.158-.812l1.216-6.893a2 2 0 0 0-1.623-2.317l-4.678-.825A1.25 1.25 0 0 0 5.52 3.613v0"
      />
      <rect
        width={8}
        height={10}
        x={3}
        y={4}
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        rx={2}
      />
    </svg>
  );
};
