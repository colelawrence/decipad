import type { SVGProps } from 'react';

export const Database = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Database</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.837 4.667c0 .737-2.257 1.5-4.835 1.5-2.579 0-4.836-.763-4.836-1.5 0-.736 2.257-1.5 4.836-1.5 2.578 0 4.834.764 4.834 1.5M12.837 8c0 .737-2.257 1.5-4.835 1.5-2.579 0-4.836-.763-4.836-1.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.837 4.667v6.669c0 .736-2.257 1.5-4.835 1.5-2.579 0-4.836-.764-4.836-1.5v-6.67"
      />
    </svg>
  );
};
