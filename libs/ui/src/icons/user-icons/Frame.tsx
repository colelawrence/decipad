import type { SVGProps } from 'react';

export const Frame = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Frame</title>
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        clipPath="url(#frame_svg__a)"
      >
        <path d="M15.755 9.098a5.251 5.251 0 1 1-4.966 9.107" />
        <path d="M4.75 14.25 10 4.75l5.25 9.5z" />
      </g>
      <defs>
        <clipPath id="frame_svg__a">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
