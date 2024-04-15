import type { SVGProps } from 'react';

export const Bookmark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Bookmark</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6.75 6.75a2 2 0 0 1 2-2h6.5a2 2 0 0 1 2 2v12.5L12 14.75l-5.25 4.5z"
      />
    </svg>
  );
};
