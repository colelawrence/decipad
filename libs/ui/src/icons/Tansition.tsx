import type { SVGProps } from 'react';

export const Tansition = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Tansition</title>
      <rect width={16} height={16} fill="currentColor" opacity={0.1} rx={4} />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.4}
        d="m5.285 10.965 4.867-4.867"
      />
      <path
        fill="currentColor"
        d="M11.688 5.161v3.074a.6.6 0 0 1-1.025.424L7.59 5.585a.6.6 0 0 1 .425-1.024h3.074a.6.6 0 0 1 .6.6"
      />
    </svg>
  );
};
