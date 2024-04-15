import type { SVGProps } from 'react';

export const Edit = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Edit</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.313}
        d="m9.007 4.5 2.5 2.5"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m3 13 2.933-.69 6.865-6.865a.69.69 0 0 0 0-.976L11.53 3.202a.69.69 0 0 0-.976 0L3.69 10.067z"
      />
    </svg>
  );
};
