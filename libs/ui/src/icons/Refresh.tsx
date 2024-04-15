import type { SVGProps } from 'react';

export const Refresh = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Refresh</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M11.418 11.417A4.833 4.833 0 1 1 12.4 6"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M12.834 3.167V5.5a.667.667 0 0 1-.667.667H9.834"
      />
    </svg>
  );
};
