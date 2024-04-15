import type { SVGProps } from 'react';

export const GitBranch = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>GitBranch</title>
      <path
        stroke="currentColor"
        strokeWidth={1.2}
        d="M6.5 4.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0ZM13 4.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0ZM4.8 6.5v3.4"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M7.167 8.67h2.907c.714 0 1.293-.61 1.293-1.36V6.8"
      />
      <path
        stroke="currentColor"
        strokeWidth={1.2}
        d="M6.5 11.25a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Z"
      />
    </svg>
  );
};
