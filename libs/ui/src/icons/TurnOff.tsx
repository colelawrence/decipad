import type { SVGProps } from 'react';

export const TurnOff = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>TurnOff</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M4.833 4.03a5.118 5.118 0 1 0 6.383-.094"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.3}
        d="M8 3v5"
      />
    </svg>
  );
};
