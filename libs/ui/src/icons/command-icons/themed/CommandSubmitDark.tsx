import type { SVGProps } from 'react';

export const CommandSubmitDark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandSubmitDark</title>
      <rect width={40} height={40} fill="#29283A" rx={8} />
      <rect
        width={18.7}
        height={13.7}
        x={10.65}
        y={13.65}
        fill="#1B1A28"
        stroke="#9B9AAC"
        strokeWidth={1.3}
        rx={3.35}
      />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m12 14.5 8 7 8-7"
      />
    </svg>
  );
};
