import type { SVGProps } from 'react';

export const AreaChart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>AreaChart</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M2 2v12h12"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        d="M4.818 11.998h7.364a.81.81 0 0 0 .818-.804V9c0-.19-.069.103-.197-.043l-1.682-1.93a.826.826 0 0 0-1.2-.044l-.536.527a.621.621 0 0 1-.905-.04L7.477 6.29a.829.829 0 0 0-1.245-.016l-2.03 2.281a.794.794 0 0 0-.202.53v2.111a.81.81 0 0 0 .818.804v-.002"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        d="m4.5 9 1.723-2.584A.934.934 0 0 1 7 6v0a1 1 0 0 1 .8.4l.745.993c.24.32.708.354.991.07l.815-.814a.51.51 0 0 1 .36-.149v0a.51.51 0 0 1 .438.248L12.5 9"
      />
    </svg>
  );
};
