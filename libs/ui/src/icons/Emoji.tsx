import type { SVGProps } from 'react';

export const Emoji = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Emoji</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M9.676 12.743a5.123 5.123 0 0 1-1.61.257C5.27 13 3 10.761 3 8s2.269-5 5.067-5C10.466 3 12.475 4.645 13 6.853"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.3 9v3M13.8 10.5h-3M6.5 9s.167 1 1.5 1 1.5-1 1.5-1"
      />
      <path
        fill="currentColor"
        d="M7.1 6.984a.65.65 0 1 1-1.3 0 .65.65 0 0 1 1.3 0M10.3 6.984a.65.65 0 1 1-1.3 0 .65.65 0 0 1 1.3 0"
      />
    </svg>
  );
};
