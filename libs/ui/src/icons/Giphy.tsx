import type { SVGProps } from 'react';

export const Giphy = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Giphy</title>
      <path
        fill="currentColor"
        d="M2.84 2v12h9.334V6.333L10.84 7.667v5H4.174V3.334h2.333L7.84 2h-5m5.334 0v4h4V4.667H10.84V3.334H9.507V2"
      />
    </svg>
  );
};
