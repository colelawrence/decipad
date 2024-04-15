import type { SVGProps } from 'react';

export const CommandPieDark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandPieDark</title>
      <rect width={40} height={40} fill="#29283A" rx={8} />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M27.368 23.115a8.001 8.001 0 0 1-9.672 4.546 8 8 0 0 1-5.56-9.128 8.003 8.003 0 0 1 4.664-5.869M28 20.002A8.004 8.004 0 0 0 20 12v8.002h8"
      />
      <path
        fill="#1B1A28"
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M28 20a7.999 7.999 0 0 0-8-8v8z"
      />
    </svg>
  );
};
