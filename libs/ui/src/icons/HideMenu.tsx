import type { SVGProps } from 'react';

export const HideMenu = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>HideMenu</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M8 4 4 8l4 4M12 4 8 8l4 4"
      />
    </svg>
  );
};
