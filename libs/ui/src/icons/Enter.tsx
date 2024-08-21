import type { SVGProps } from 'react';

export const Enter = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 32 32"
      role="img"
      {...props}
    >
      <title>Enter</title>
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m14.167 20.833-3-2.833 3-2.834"
      />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M11.166 18h7a2.667 2.667 0 0 0 2.667-2.667v-4.166"
      />
    </svg>
  );
};
