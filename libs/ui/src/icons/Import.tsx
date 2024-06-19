import type { SVGProps } from 'react';

export const Import = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Import</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M7.84 2.4v5.197M9.79 5.323 7.953 7.465a.148.148 0 0 1-.225 0L5.892 5.323"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.3}
        d="M9.464 9.053h1.949c.963 0 2.167 1.06 2.167 2.36S12.268 13.6 11.413 13.6H4.267c-.75 0-1.867-.974-1.867-2.274 0-1.299 1.118-2.273 1.867-2.273h1.949"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.2}
        d="M6.58 11.326h2.625"
      />
    </svg>
  );
};
