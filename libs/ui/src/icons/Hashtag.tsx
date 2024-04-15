import type { SVGProps } from 'react';

export const Hashtag = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Hashtag</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M2.8 6h10.4M2.8 10h10.4M10 2.8v10.4M6 2.8v10.4"
      />
    </svg>
  );
};
