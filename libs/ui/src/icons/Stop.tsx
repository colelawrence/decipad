import type { SVGProps } from 'react';

export const Stop = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Stop</title>
      <path
        stroke="currentColor"
        strokeWidth={1.3}
        d="M3 11V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
      />
    </svg>
  );
};
