import type { SVGProps } from 'react';

export const Photo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Photo</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17.25 4.75H6.75a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2V6.75a2 2 0 0 0-2-2"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m4.75 16 2.746-3.493a2 2 0 0 1 3.09-.068L13 15.25"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.915 12.823a626 626 0 0 0 2.576-3.31l.01-.013a2 2 0 0 1 3.085-.06L19 12.25"
      />
    </svg>
  );
};
