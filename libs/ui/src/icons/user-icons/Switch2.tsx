import type { SVGProps } from 'react';

export const Switch2 = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Switch2</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.75 5.75a1 1 0 0 1 1-1h12.5a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1H5.75a1 1 0 0 1-1-1zM4.75 14.75a1 1 0 0 1 1-1h12.5a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1H5.75a1 1 0 0 1-1-1zM16.25 5v5M16.25 14v5"
      />
    </svg>
  );
};
