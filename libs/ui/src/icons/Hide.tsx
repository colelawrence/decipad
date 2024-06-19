import type { SVGProps } from 'react';

export const Hide = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Hide</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M4.552 10.944C3.422 9.84 3 8.408 3 8c0-.69 1.207-4.31 5-4.31 1.238 0 2.2.385 2.935.929m1.634 2.002c.303.62.43 1.155.43 1.379 0 .69-1.206 4.31-4.999 4.31-.504 0-.963-.064-1.38-.176zM13 3 3 13"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.034}
        d="M6.903 9.097a1.552 1.552 0 0 1 2.194-2.194"
      />
    </svg>
  );
};
