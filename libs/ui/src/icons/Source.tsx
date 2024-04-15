import type { SVGProps } from 'react';

export const Source = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Source</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M10.5 5.833 12.833 8 10.5 10.167M5.5 5.833 3.167 8 5.5 10.167"
      />
    </svg>
  );
};
