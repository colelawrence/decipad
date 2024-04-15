import type { SVGProps } from 'react';

export const Add = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Add</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M8 4v8"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M4 8h8"
      />
    </svg>
  );
};
