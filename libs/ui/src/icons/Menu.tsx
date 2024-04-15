import type { SVGProps } from 'react';

export const Menu = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Menu</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3.2 8.2h9.4M3.2 5h9.4M3.2 11.4h9.4"
      />
    </svg>
  );
};
