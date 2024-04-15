import type { SVGProps } from 'react';

export const Textcolor = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Textcolor</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3.6 13h8.667M4.5 10 8 3l3.5 7M5.5 8h5"
      />
    </svg>
  );
};
