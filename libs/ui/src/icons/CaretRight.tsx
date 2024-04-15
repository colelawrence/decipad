import type { SVGProps } from 'react';

export const CaretRight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>CaretRight</title>
      <path
        fill="currentColor"
        d="m9.572 9.192-1.222.978c-.833.666-1.249.999-1.599 1a1 1 0 0 1-.783-.377c-.218-.273-.218-.806-.218-1.872V7.343c0-1.139 0-1.708.23-1.985a1 1 0 0 1 .812-.362c.36.015.782.396 1.628 1.157l1.21 1.088c.385.347.578.52.644.723a.8.8 0 0 1-.016.544c-.078.198-.28.36-.686.684"
      />
    </svg>
  );
};
