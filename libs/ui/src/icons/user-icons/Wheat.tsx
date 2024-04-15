import type { SVGProps } from 'react';

export const Wheat = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Wheat</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 19.25V4.75m.75 5.5v-1.5a3 3 0 0 1 3-3h1.5v1.5a3 3 0 0 1-3 3zm-1.5 0v-1.5a3 3 0 0 0-3-3h-1.5v1.5a3 3 0 0 0 3 3zm1.5 7v-1.5a3 3 0 0 1 3-3h1.5v1.5a3 3 0 0 1-3 3zm-1.5 0v-1.5a3 3 0 0 0-3-3h-1.5v1.5a3 3 0 0 0 3 3z"
      />
    </svg>
  );
};
