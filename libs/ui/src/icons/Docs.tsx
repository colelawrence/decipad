import type { SVGProps } from 'react';

export const Docs = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Docs</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeWidth={1.2}
        d="M4.198 2.8h8.387c.145 0 .262.117.262.262v9.87a.262.262 0 0 1-.262.261h-8.4c-.83 0-1.385-.693-1.385-1.386v-7.61c0-.771.626-1.397 1.398-1.397Z"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeWidth={1.2}
        d="M4.457 10.076h8.39v2.768a.35.35 0 0 1-.35.35h-7.95c-.874.045-1.747-.359-1.747-1.467 0-1.109.692-1.651 1.657-1.651Z"
      />
    </svg>
  );
};
