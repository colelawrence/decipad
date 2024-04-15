import type { SVGProps } from 'react';

export const CommandLineDark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandLineDark</title>
      <rect width={40} height={40} fill="#29283A" rx={8} />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.75 11.75v16.5h16.5"
      />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m27 15.5-4.097 6.933-3.361-3.385-4.355 5.077"
      />
    </svg>
  );
};
