import type { SVGProps } from 'react';

export const ZeroChart = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ZeroChart</title>
      <rect
        width={12}
        height={12}
        x={2}
        y={2}
        fill="currentColor"
        fillOpacity={0.1}
        rx={3}
      />
      <path
        stroke="currentColor"
        strokeWidth={1.2}
        d="M2 11V5a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3Z"
      />
      <path
        fill="currentColor"
        d="M8.005 11.379c-1.598 0-2.505-1.253-2.505-3.358 0-2.078.971-3.321 2.505-3.321 1.524 0 2.495 1.234 2.495 3.376 0 2.05-.917 3.303-2.495 3.303M6.662 8.112c0 1.552.544 2.296 1.352 2.296.807 0 1.334-.753 1.334-2.314 0-1.67-.527-2.423-1.334-2.423-.835 0-1.352.753-1.352 2.44"
      />
    </svg>
  );
};
