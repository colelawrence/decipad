import type { SVGProps } from 'react';

export const Home = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Home</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M4.5 12.833h7c.737 0 1.334-.597 1.334-1.333v-5L8 3.167 3.167 6.5v5c0 .736.597 1.333 1.333 1.333"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M6.5 10.5c0-.737.596-1.334 1.333-1.334h.333c.737 0 1.333.597 1.333 1.334v2.333h-3V10.5"
      />
    </svg>
  );
};
