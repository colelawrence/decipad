import type { SVGProps } from 'react';

export const CaretUp = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>CaretUp</title>
      <path
        fill="currentColor"
        d="M9.442 6.678 10.42 7.9c.666.833.999 1.249 1 1.599a1 1 0 0 1-.377.782c-.273.219-.806.219-1.872.219H7.593c-1.139 0-1.708 0-1.985-.23a1 1 0 0 1-.362-.812c.015-.36.396-.782 1.157-1.628l1.088-1.21c.347-.385.52-.578.723-.644a.8.8 0 0 1 .544.016c.198.078.36.28.684.686"
      />
    </svg>
  );
};
