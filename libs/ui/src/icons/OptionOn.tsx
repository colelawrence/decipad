import type { SVGProps } from 'react';

export const OptionOn = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>OptionOn</title>
      <path fill="currentColor" d="M5 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0" />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8"
      />
    </svg>
  );
};
