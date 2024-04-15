import type { SVGProps } from 'react';

export const Pencil = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Pencil</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m4.75 19.25 4.25-1 9.95-9.95a1 1 0 0 0 0-1.413L17.112 5.05a1 1 0 0 0-1.414 0L5.75 15zM14.023 7.04l3 3"
      />
    </svg>
  );
};
