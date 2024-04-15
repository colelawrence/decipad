import type { SVGProps } from 'react';

export const ListBulleted = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ListBulleted</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3.45 8.15h.3M3.45 4.95h.3M3.45 11.35h.3M6.65 8.15h5.9M6.65 4.95h5.9M6.65 11.35h5.9"
      />
    </svg>
  );
};
