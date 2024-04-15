import type { SVGProps } from 'react';

export const Bank = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Bank</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.25 19.25V11.5m4 0v7.75zm-12.5 7.75V11.5zm4 0V11.5zM12 4.75l7.25 6.5H4.75zM4.75 19.25h14.5"
      />
    </svg>
  );
};
