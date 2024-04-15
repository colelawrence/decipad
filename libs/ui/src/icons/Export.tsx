import type { SVGProps } from 'react';

export const Export = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Export</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M7.84 7.597V2.4M5.892 4.674 7.728 2.53c.059-.069.166-.069.225 0L9.79 4.674M9.464 9.053h1.949c.963 0 2.167 1.06 2.167 2.36 0 1.299-1.312 2.187-2.167 2.187H4.267c-.75 0-1.867-.974-1.867-2.274 0-1.299 1.118-2.273 1.867-2.273h1.949M6.58 11.326h2.626"
      />
    </svg>
  );
};
