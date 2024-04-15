import type { SVGProps } from 'react';

export const LogIn = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>LogIn</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M2 8h6.5"
      />
      <path
        fill="currentColor"
        d="m10.076 8.424-2.552 2.552A.6.6 0 0 1 6.5 10.55V5.45a.6.6 0 0 1 1.024-.425l2.552 2.552a.6.6 0 0 1 0 .848"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M10 13h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"
      />
    </svg>
  );
};
