import type { SVGProps } from 'react';

export const Command = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Command</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M11.333 3a1.667 1.667 0 0 0-1.666 1.667v6.666a1.666 1.666 0 1 0 1.666-1.666H4.667a1.667 1.667 0 1 0 1.666 1.666V4.667a1.667 1.667 0 1 0-1.666 1.666h6.666a1.666 1.666 0 1 0 0-3.333"
      />
    </svg>
  );
};
