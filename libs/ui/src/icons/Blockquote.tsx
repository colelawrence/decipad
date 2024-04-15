import type { SVGProps } from 'react';

export const Blockquote = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Blockquote</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 7.5c0 .736-.597 1.333-1.333 1.333H4.5A1.333 1.333 0 0 1 3.167 7.5V6.042a2 2 0 0 1 .643-1.47l1.523-1.405v2h.833c.737 0 1.334.597 1.334 1.333v1"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.833 11.5c0 .736-.597 1.333-1.333 1.333H9.833A1.333 1.333 0 0 1 8.5 11.5v-1.458a2 2 0 0 1 .643-1.47l1.524-1.405v2h.833c.736 0 1.333.597 1.333 1.333v1"
      />
    </svg>
  );
};
