import type { SVGProps } from 'react';

export const Highlight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Highlight</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.235}
        d="M5 3v2.059c.686 1.235 1.647 4.035 1.647 5.353h3.706C10.353 9.176 12 5.059 12 5.059V3M7.059 13.294v-2.882H9.94v1.647l-2.882 1.235M5 5.059h7"
      />
    </svg>
  );
};
