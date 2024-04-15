import type { SVGProps } from 'react';

export const Question = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Question</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M6 6.037a2 2 0 0 1 3.887.666c0 1.334-2 2-2 2M7.94 11h.006"
      />
    </svg>
  );
};
