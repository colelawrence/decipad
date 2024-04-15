import type { SVGProps } from 'react';

export const Email = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Email</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 4.94c0-.795.741-1.44 1.655-1.44h8.69c.914 0 1.655.645 1.655 1.44v6.12c0 .795-.741 1.44-1.655 1.44h-8.69C2.741 12.5 2 11.855 2 11.06z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2.5 5 8 8l5.5-3"
      />
    </svg>
  );
};
