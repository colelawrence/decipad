import type { SVGProps } from 'react';

export const RadarChart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>RadarChart</title>
      <path
        fill="currentColor"
        d="M7.74 1.46a.6.6 0 0 1 .52 0l4.691 2.258a.6.6 0 0 1 .325.408l1.158 5.076a.6.6 0 0 1-.115.507l-3.247 4.07a.6.6 0 0 1-.469.227H5.397a.6.6 0 0 1-.47-.226L1.681 9.71a.6.6 0 0 1-.116-.508l1.159-5.076a.6.6 0 0 1 .325-.408zM3.83 4.673 2.8 9.187l2.886 3.619h4.628L13.2 9.187l-1.03-4.513L8 2.666z"
      />
      <path
        stroke="currentColor"
        d="m8.5 4.5.802 3L11.5 8l-2 3.5-2.802-.797-1.623-2.035V5.5z"
      />
    </svg>
  );
};
