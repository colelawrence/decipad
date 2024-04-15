import type { SVGProps } from 'react';

export const User = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>User</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M3 13c.507-1.216 1.235-2.226 2.113-2.928C5.991 9.37 6.987 9 8 9c1.014 0 2.01.37 2.887 1.072.877.702 1.606 1.712 2.113 2.928"
      />
    </svg>
  );
};
