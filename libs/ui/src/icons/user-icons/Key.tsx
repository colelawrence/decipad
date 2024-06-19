import type { SVGProps } from 'react';

export const Key = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Key</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 13.25a4.25 4.25 0 1 0-4.154-3.346L4.75 16v3.25H8l.75-.75v-1.75h1.75l1.25-1.25v-1.75h1.75l.596-.596q.438.095.904.096"
      />
      <path stroke="currentColor" d="M16.5 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
    </svg>
  );
};
