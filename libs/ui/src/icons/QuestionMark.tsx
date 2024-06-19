import type { SVGProps } from 'react';

export const QuestionMark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>QuestionMark</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M5 5.503a3.02 3.02 0 0 1 1.348-1.59 3.17 3.17 0 0 1 2.086-.37 3.1 3.1 0 0 1 1.84 1.024c.47.542.727 1.227.726 1.935C11 8.501 7.913 9.5 7.913 9.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7.953 12.5h.01"
      />
    </svg>
  );
};
