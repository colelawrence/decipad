import type { SVGProps } from 'react';

export const LogOut = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>LogOut</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M6 8h6.5"
      />
      <path
        fill="currentColor"
        d="m14.076 8.424-2.552 2.552a.6.6 0 0 1-1.024-.425V5.45a.6.6 0 0 1 1.024-.425l2.552 2.552a.6.6 0 0 1 0 .848"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M6 3H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"
      />
    </svg>
  );
};
