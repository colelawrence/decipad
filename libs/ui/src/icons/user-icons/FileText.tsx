import type { SVGProps } from 'react';

export const FileText = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>FileText</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7.75 19.25h8.5a2 2 0 0 0 2-2V9L14 4.75H7.75a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18 9.25h-4.25V5M9.75 15.25h4.5M9.75 12.25h4.5"
      />
    </svg>
  );
};
