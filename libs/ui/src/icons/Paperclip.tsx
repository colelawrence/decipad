import type { SVGProps } from 'react';

export const Paperclip = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Paperclip</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m13 7.966-4.218 4.075c-1.323 1.278-3.467 1.278-4.79 0a3.195 3.195 0 0 1 .012-4.64l3.893-3.745a2.375 2.375 0 0 1 3.277 0 2.186 2.186 0 0 1-.008 3.174L7.23 10.611a1.28 1.28 0 0 1-1.77 0 1.18 1.18 0 0 1 0-1.71l3.26-3.149"
      />
    </svg>
  );
};
