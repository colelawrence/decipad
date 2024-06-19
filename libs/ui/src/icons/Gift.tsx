import type { SVGProps } from 'react';

export const Gift = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Gift</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M13.5 5.671h-11a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5M13 8.671v4.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-4.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M8 5.671v8M10.831 4.965C10.12 5.671 8 5.671 8 5.671s0-2.118.706-2.831a1.503 1.503 0 0 1 2.125 2.125M5.169 4.965c.712.706 2.83.706 2.83.706s0-2.118-.705-2.831a1.503 1.503 0 0 0-2.125 2.125"
      />
    </svg>
  );
};
