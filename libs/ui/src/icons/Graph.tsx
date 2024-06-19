import type { SVGProps } from 'react';

export const Graph = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Graph</title>
      <circle cx={12} cy={4} r={2} fill="currentColor" fillOpacity={0.1} />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5.334 8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0m.76 1.242a2.666 2.666 0 1 1 0-2.483l3.617-2.261a2.667 2.667 0 1 1 .439.858L6.385 7.709a2.7 2.7 0 0 1 0 .582l3.765 2.354a2.667 2.667 0 1 1-.439.858zm6.173-3.908a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.6 6.933a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0"
        clipRule="evenodd"
      />
    </svg>
  );
};
