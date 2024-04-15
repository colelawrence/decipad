import type { SVGProps } from 'react';

export const Strikethrough = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Strikethrough</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M3.2 8.059h9.518M12.061 5.433V5.27A1.97 1.97 0 0 0 10.092 3.3H5.826a1.97 1.97 0 0 0-1.97 1.97v.82a1.97 1.97 0 0 0 1.97 1.969h4.102M3.856 10.356v.328a1.97 1.97 0 0 0 1.97 1.97h4.266c1.088 0 1.97-.882 1.97-1.97V9.7"
      />
    </svg>
  );
};
