import type { SVGProps } from 'react';

export const Bulb = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Bulb</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M8 2.5c-2.667 0-4 2.086-4 3.983 0 3.034 2.286 3.414 2.286 4.552v1.707a.76.76 0 0 0 .762.758h1.904a.76.76 0 0 0 .762-.758v-1.708C9.714 9.897 12 9.518 12 6.483 12 4.586 10.667 2.5 8 2.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M7 11.5h2"
      />
    </svg>
  );
};
