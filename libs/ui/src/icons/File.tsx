import type { SVGProps } from 'react';

export const File = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>File</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M4.599 13.8h6.8a1.6 1.6 0 0 0 1.6-1.6V5.6L9.6 2.198h-5a1.6 1.6 0 0 0-1.6 1.6V12.2a1.6 1.6 0 0 0 1.6 1.6"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M12.801 5.8h-3.4V2.4"
      />
    </svg>
  );
};
