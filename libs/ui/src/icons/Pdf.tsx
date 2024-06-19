import type { SVGProps } from 'react';

export const Pdf = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Pdf</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M1.5 11.5V8.27m0 0V4.5h1.8c.663 0 1.2.482 1.2 1.077v1.615c0 .595-.537 1.077-1.2 1.077zM7.786 4.5H6.5v7h1.286c.947 0 1.714-.964 1.714-2.154V6.654c0-1.19-.767-2.154-1.714-2.154M14.5 4.5h-3v3.23m0 0v3.77m0-3.77h3"
      />
    </svg>
  );
};
