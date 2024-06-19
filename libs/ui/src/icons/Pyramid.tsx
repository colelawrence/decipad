import type { SVGProps } from 'react';

export const Pyramid = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Pyramid</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3 10.241 8 13V3z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m8 13 5-2.759L8 3"
      />
    </svg>
  );
};
