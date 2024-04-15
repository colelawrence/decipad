import type { SVGProps } from 'react';

export const Sparkles = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Sparkles</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M5.368 7.69C4.593 9 3.045 9 2.4 9c.645 0 2.193.262 2.968 1.31.774 1.047.989 2.599 1.032 3.69 0-.83.375-2.802 1.032-3.69C8.206 9.262 9.755 9 10.4 9c-.645 0-2.194 0-2.968-1.31C6.71 6.47 6.586 4.96 6.5 4c-.086.96-.44 2.52-1.132 3.69Z"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={0.8}
        d="M11.049 4.272C10.619 5 9.759 5 9.399 5c.36 0 1.22.146 1.65.728.43.582.55 1.166.573 1.772 0-.46.209-1.279.574-1.772.43-.582 1.29-.728 1.648-.728-.358 0-1.218 0-1.648-.728a3.984 3.984 0 0 1-.574-1.772 4.09 4.09 0 0 1-.573 1.772Z"
      />
    </svg>
  );
};
