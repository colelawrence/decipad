import type { SVGProps } from 'react';

export const CommandFunnelDark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandFunnelDark</title>
      <rect width={40} height={40} fill="#29283A" rx={8} />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.75 11.75v16.5h16.5M16 25V15M19.5 25v-7M23 25v-5M26.5 25v-4"
      />
    </svg>
  );
};
