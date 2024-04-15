import type { SVGProps } from 'react';

export const Speaker = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Speaker</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5.75 6.75a2 2 0 0 1 2-2h8.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-8.5a2 2 0 0 1-2-2z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.25 14a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.5 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
      />
    </svg>
  );
};
