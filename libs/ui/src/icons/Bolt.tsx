import type { SVGProps } from 'react';

export const Bolt = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Bolt</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M7.048 9.034H4L8.952 2v4.966H12L7.048 14V9.034"
      />
    </svg>
  );
};
