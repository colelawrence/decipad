import type { SVGProps } from 'react';

export const TableSmall = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>TableSmall</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        d="M2 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2"
      />
      <path
        stroke="currentColor"
        strokeWidth={1.2}
        d="M8 2v12M2 8h12M2 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"
      />
    </svg>
  );
};
