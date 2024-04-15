import type { SVGProps } from 'react';

export const Ellipsis = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Ellipsis</title>
      <path
        fill="currentColor"
        d="M3.8 7c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1m8.4 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1M8 7c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1"
      />
    </svg>
  );
};
