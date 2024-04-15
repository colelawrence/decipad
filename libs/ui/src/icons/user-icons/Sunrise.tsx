import type { SVGProps } from 'react';

export const Sunrise = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Sunrise</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m9.25 16.25-.687-.75a4.25 4.25 0 1 1 6.875 0l-.688.75M4.74 16.25h14.51M6.74 19.25h10.51M12 4.75v.5M15.625 5.721l-.25.433M18.279 8.375l-.433.25M19.25 12h-.5M5.25 12h-.5M6.155 8.625l-.433-.25M8.625 6.154l-.25-.433"
      />
    </svg>
  );
};
