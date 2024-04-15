import type { SVGProps } from 'react';

export const Underline = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Underline</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M4.683 3v3.792a3.25 3.25 0 1 0 6.5 0V3M3.6 13h8.667"
      />
    </svg>
  );
};
