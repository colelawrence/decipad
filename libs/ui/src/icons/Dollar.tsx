import type { SVGProps } from 'react';

export const Dollar = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="presentation"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M7.813 3v1.406M7.813 11.435l.001 1.808M5.512 11.438h3.355a1.758 1.758 0 0 0 0-3.515h-2.11a1.758 1.758 0 1 1 0-3.516h3.164"
      />
    </svg>
  );
};
