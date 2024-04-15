import type { SVGProps } from 'react';

export const WarningCircle = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>WarningCircle</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 4.516c.457 0 .828.37.828.828V7a.828.828 0 1 1-1.656 0V5.344c0-.457.37-.828.828-.828M8.828 10.311a.828.828 0 1 1-1.656 0 .828.828 0 0 1 1.656 0"
        clipRule="evenodd"
      />
    </svg>
  );
};
