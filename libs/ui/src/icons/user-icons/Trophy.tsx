import type { SVGProps } from 'react';

export const Trophy = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Trophy</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m14.25 8.75 4-4H5.75l4 4M12 19.25a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5"
      />
    </svg>
  );
};
