import type { SVGProps } from 'react';

export const Lock = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Lock</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M5.167 7v-.105c0-1.04-.063-2.201.664-2.946.415-.425 1.086-.782 2.17-.782 1.083 0 1.754.357 2.168.782.727.745.665 1.905.665 2.946V7"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3.833 7.833c0-.368.298-.667.667-.667h7c.368 0 .666.299.666.667V11.5c0 .736-.597 1.333-1.333 1.333H5.166A1.333 1.333 0 0 1 3.833 11.5V7.833"
      />
    </svg>
  );
};
