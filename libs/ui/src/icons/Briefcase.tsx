import type { SVGProps } from 'react';

export const Briefcase = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Briefcase</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M3.167 6.5c0-.737.596-1.333 1.333-1.333h7c.736 0 1.333.596 1.333 1.333v5c0 .736-.597 1.333-1.333 1.333h-7A1.333 1.333 0 0 1 3.167 11.5z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M5.834 5v-.5c0-.737.596-1.333 1.333-1.333h1.667c.736 0 1.333.596 1.333 1.333V5M3.334 8.834h9.333M5.834 7.834V9.5M10.167 7.834V9.5"
      />
    </svg>
  );
};
