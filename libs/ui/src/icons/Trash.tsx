import type { SVGProps } from 'react';

export const Trash = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Trash</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        d="m3.5 4.359.721 8.29a1.714 1.714 0 0 0 1.708 1.566h4.142c.89 0 1.63-.68 1.708-1.566l.72-8.29"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.286}
        d="m3.5 4.359.721 8.29a1.714 1.714 0 0 0 1.708 1.566h4.142c.89 0 1.63-.68 1.708-1.566l.72-8.29M6.071 4.144v-.642c0-.947.768-1.714 1.714-1.714h.429c.947 0 1.714.767 1.714 1.714v.642M2.001 4.359h12"
      />
    </svg>
  );
};
