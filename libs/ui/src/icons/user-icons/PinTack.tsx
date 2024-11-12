import type { SVGProps } from 'react';

export const PinTack = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>PinTack</title>
      <path
        stroke="currentColor"
        d="m5.833 5.167-.666-2h5.667l-.667 2v1.5c2 .666 2 2.833 2 2.833H3.833s0-2.167 2-2.833v-1.5ZM8 9.667v3.166"
      />
    </svg>
  );
};
