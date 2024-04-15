import type { SVGProps } from 'react';

export const All = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>All</title>
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        clipPath="url(#All_svg__a)"
      >
        <path d="M8 2.5v11M3.237 5.25l9.526 5.5M3.237 10.75l9.526-5.5" />
      </g>
      <defs>
        <clipPath id="All_svg__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
