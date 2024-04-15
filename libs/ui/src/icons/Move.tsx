import type { SVGProps } from 'react';

export const Move = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Move</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M5.5 7.5 3.167 5.333 5.5 3.167M3.167 5.333h7M10.5 8.5l2.333 2.167-2.333 2.166M12.834 10.667h-7"
      />
    </svg>
  );
};
