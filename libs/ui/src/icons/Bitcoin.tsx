import type { SVGProps } from 'react';

export const Bitcoin = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Bitcoin</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M6.395 1.962a.6.6 0 0 1 .6.6v1.45h-1.2v-1.45a.6.6 0 0 1 .6-.6m-.6 9.144v2.332a.6.6 0 1 0 1.2 0v-2.332zm2.472 0v2.332a.6.6 0 1 0 1.2 0v-2.332zm1.2-7.094v-1.45a.6.6 0 0 0-1.2 0v1.45z"
        clipRule="evenodd"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M4.2 4.326h5.292a1.764 1.764 0 1 1 0 3.529H4.2z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M4.2 7.854h5.734a1.764 1.764 0 1 1 0 3.529H4.2z"
      />
    </svg>
  );
};
