import type { SVGProps } from 'react';

export const StyleBold = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>StyleBold</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M4 3h5a2.5 2.5 0 0 1 0 5H4zM4 8h5.625a2.5 2.5 0 0 1 0 5H4z"
      />
    </svg>
  );
};
