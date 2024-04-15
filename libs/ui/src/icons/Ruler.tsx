import type { SVGProps } from 'react';

export const Ruler = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Ruler</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="m13.75 5.25-3-3-8.5 8.5 3 3 8.5-8.5Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.25 7.991.86.891M6.25 9.991l.86.891M10.25 5.991l.86.891"
      />
    </svg>
  );
};
