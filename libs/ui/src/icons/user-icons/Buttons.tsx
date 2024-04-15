import type { SVGProps } from 'react';

export const Buttons = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Buttons</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7.75 9.25v.01m8.5 4.99v.01m-11.5.99v-6.5a2 2 0 0 1 2-2h4v10.5h-4a2 2 0 0 1-2-2m14.5 0v-6.5a2 2 0 0 0-2-2h-4v10.5h4a2 2 0 0 0 2-2"
      />
    </svg>
  );
};
