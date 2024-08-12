import type { SVGProps } from 'react';

export const CommandLayoutDark = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandLayoutDark</title>
      <rect width={40} height={40} rx={8} fill="#29283A" />
      <rect x={15} y={12} width={10} height={1.5} rx={0.75} fill="#9B9AAC" />
      <rect
        x={11.25}
        y={16.25}
        width={17.5}
        height={7.5}
        rx={1.55}
        fill="#1B1A28"
      />
      <rect
        x={11.25}
        y={16.25}
        width={17.5}
        height={7.5}
        rx={1.55}
        stroke="#9B9AAC"
        strokeWidth={1.5}
      />
      <rect x={15} y={26.5} width={10} height={1.5} rx={0.75} fill="#9B9AAC" />
    </svg>
  );
};
