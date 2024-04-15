import type { SVGProps } from 'react';

export const Cocktail = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Cocktail</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7.75 19.25h8.5M12 19v-4.25m0 0-6.25-8h12.5zM16.25 4.75l-3.5 4.5"
      />
    </svg>
  );
};
