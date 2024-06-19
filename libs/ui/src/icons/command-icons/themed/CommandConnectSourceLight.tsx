import type { SVGProps } from 'react';

export const CommandConnectSourceLight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandConnectSourceLight</title>
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <rect
        width={18.7}
        height={16.7}
        x={10.65}
        y={11.65}
        fill="#fff"
        stroke="#4D5664"
        strokeWidth={1.3}
        rx={3.35}
      />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.9}
        d="M19.405 22.603H17.5l3.095-4.103v2.897H22.5L19.405 25.5z"
      />
      <path
        fill="#ECF0F6"
        stroke="#4D5664"
        strokeWidth={1.3}
        d="M14 11.65h12c1.85 0 3.35 1.5 3.35 3.35v1.35h-18.7V15c0-1.85 1.5-3.35 3.35-3.35Z"
      />
    </svg>
  );
};
