import type { SVGProps } from 'react';

export const Link = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Link</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M6.933 8.534a2.667 2.667 0 0 0 4.021.288l1.6-1.6a2.667 2.667 0 0 0-3.77-3.77l-.918.912"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M9.065 7.466a2.667 2.667 0 0 0-4.021-.288l-1.6 1.6a2.667 2.667 0 0 0 3.77 3.771l.913-.912"
      />
    </svg>
  );
};
