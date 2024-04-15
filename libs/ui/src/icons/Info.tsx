import type { SVGProps } from 'react';

export const Info = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Info</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 11.484a.828.828 0 0 1-.828-.828V9a.828.828 0 1 1 1.656 0v1.656c0 .457-.37.828-.828.828M7.172 5.689a.828.828 0 1 1 1.656 0 .828.828 0 0 1-1.656 0"
        clipRule="evenodd"
      />
    </svg>
  );
};
