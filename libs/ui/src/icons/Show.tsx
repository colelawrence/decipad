import type { SVGProps } from 'react';

export const Show = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Show</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M13 8.31c0 .69-1.207 4.31-5 4.31S3 9 3 8.31C3 7.62 4.207 4 8 4s5 3.62 5 4.31"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M8 9.862a1.552 1.552 0 1 0 0-3.103 1.552 1.552 0 0 0 0 3.103"
      />
    </svg>
  );
};
