import type { SVGProps } from 'react';

export const Key = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Key</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.069 8.862a2.931 2.931 0 1 0-2.865-2.307L3 10.759v2.242H5.24l.517-.518v-1.207h1.207l.862-.862V9.207h1.207l.412-.411c.2.044.41.066.623.066"
      />
      <path
        stroke="currentColor"
        d="M11.104 5.241a.345.345 0 1 1-.69 0 .345.345 0 0 1 .69 0Z"
      />
    </svg>
  );
};
