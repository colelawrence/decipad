import type { SVGProps } from 'react';

export const List = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>List</title>
      <rect
        width={12}
        height={6}
        x={2}
        y={8.036}
        fill="currentColor"
        fillOpacity={0.1}
        rx={2.4}
      />
      <path
        stroke="currentColor"
        strokeWidth={1.2}
        d="M2.429 8.036h11.143M2 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"
      />
    </svg>
  );
};
