import type { SVGProps } from 'react';

export const CommandPieLight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandPieLight</title>
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M27.368 23.115a8 8 0 0 1-9.672 4.546 8 8 0 0 1-5.56-9.128 8 8 0 0 1 4.664-5.869M28 20.002A8.004 8.004 0 0 0 20 12v8.002z"
      />
      <path
        fill="#fff"
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M28 20a8 8 0 0 0-8-8v8z"
      />
    </svg>
  );
};
