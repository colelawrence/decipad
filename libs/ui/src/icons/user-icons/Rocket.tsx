import type { SVGProps } from 'react';

export const Rocket = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Rocket</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.456 6.855a8 8 0 0 1 5.408-2.105h.386v.386a8 8 0 0 1-2.105 5.408l-6.15 6.704-4.243-4.243 6.704-6.15M7.25 16.75l-2.5 2.5M9.25 18.75l-.5.5M5.25 14.75l-.5.5M13 19.25 14.24 14 11 17.25zM6.75 13 10 9.75l-5.25 1z"
      />
    </svg>
  );
};
