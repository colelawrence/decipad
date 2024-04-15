import type { SVGProps } from 'react';

export const Unsplash = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Unsplash</title>
      <path
        fill="currentColor"
        d="M5.75 5.375V2h4.5v3.375zm4.5 1.875H14V14H2V7.25h3.75v3.375h4.5z"
      />
    </svg>
  );
};
