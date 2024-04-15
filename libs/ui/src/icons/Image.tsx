import type { SVGProps } from 'react';

export const Image = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Image</title>
      <path
        stroke="currentColor"
        strokeWidth={1.2}
        d="M2 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        d="M4.273 8.224 2 11.216v1.07C2 13.234 2.741 14 3.655 14h8.69c.914 0 1.655-.767 1.655-1.713l-.207-4.283-1.998-2.407a1.62 1.62 0 0 0-2.553.052l-.008.01-.015.021c-.162.217-1.294 1.732-2.117 2.815l-.273-.329a1.62 1.62 0 0 0-2.556.058"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M8.828 10.574 6.829 8.166a1.62 1.62 0 0 0-2.556.058L2 11.216v1.07C2 13.234 2.741 14 3.655 14h8.69c.914 0 1.655-.767 1.655-1.713l-.207-4.283-1.998-2.407a1.62 1.62 0 0 0-2.56.063c-.079.104-1.275 1.705-2.133 2.835"
      />
    </svg>
  );
};
