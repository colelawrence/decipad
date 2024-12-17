import type { SVGProps } from 'react';

export const Formula = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="presentation"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.3}
        d="M4.05 11.54c.314 1.674 3.517 2.113 3.883-.556.234-1.708.202-4.154.446-5.933.1-.732.642-2.59 3.772-1.617M5.686 6.668h5.388"
      />
    </svg>
  );
};
