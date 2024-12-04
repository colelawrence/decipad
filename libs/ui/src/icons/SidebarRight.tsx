import type { SVGProps } from 'react';

export const SidebarRight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>SidebarRight</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeWidth={1.2}
        d="M13 5L13 11C13 12.1046 12.1046 13 11 13L5 13C3.89543 13 3 12.1046 3 11L3 5C3 3.89543 3.89543 3 5 3L11 3C12.1046 3 13 3.89543 13 5Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M10 5.5L10 10.5"
      />
    </svg>
  );
};
