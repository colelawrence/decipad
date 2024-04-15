import type { SVGProps } from 'react';

export const Droplet = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Droplet</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.25 14.071c0 2.86-2.35 5.179-5.25 5.179s-5.25-2.318-5.25-5.179C6.75 11.211 12 4.75 12 4.75s5.25 6.461 5.25 9.321"
      />
    </svg>
  );
};
