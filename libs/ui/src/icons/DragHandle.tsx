import type { SVGProps } from 'react';

export const DragHandle = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>DragHandle</title>
      <path
        fill="currentColor"
        d="M5.75 6.9a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M10.25 6.9a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M5.75 11.65a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M10.25 11.65a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5"
      />
    </svg>
  );
};
