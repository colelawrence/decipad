import type { SVGProps } from 'react';

export const Transpose = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Transpose</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M9 13h1.177A2.823 2.823 0 0 0 13 10.177V9"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.8 12-1 1 1 1M14 8.7l-1-1-1 1"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M7.414 4.5h5.172c.229 0 .414-.203.414-.455v-1.59c0-.252-.185-.455-.414-.455H7.414C7.185 2 7 2.204 7 2.455v1.59c0 .252.185.455.414.455M2 7.414v5.172c0 .229.204.414.455.414h1.59c.252 0 .455-.185.455-.414V7.414C4.5 7.185 4.297 7 4.045 7h-1.59C2.203 7 2 7.185 2 7.414"
      />
    </svg>
  );
};
