import type { SVGProps } from 'react';

export const Table = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Table</title>
      <path
        stroke="currentColor"
        strokeWidth={1.2}
        d="M14.543 4.8v6.5a2.4 2.4 0 0 1-2.4 2.4H3.857a2.4 2.4 0 0 1-2.4-2.4V4.8a2.4 2.4 0 0 1 2.4-2.4h8.286a2.4 2.4 0 0 1 2.4 2.4Z"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeWidth={1.2}
        d="M3.857 2.4h8.286a2.4 2.4 0 0 1 2.4 2.4v1.162H1.457V4.8a2.4 2.4 0 0 1 2.4-2.4Z"
      />
      <path
        stroke="currentColor"
        strokeWidth={1.2}
        d="M2.048 9.7h13.095M8 5.8v8"
      />
    </svg>
  );
};
