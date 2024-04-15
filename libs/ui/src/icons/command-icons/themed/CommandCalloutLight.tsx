import type { SVGProps } from 'react';

export const CommandCalloutLight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandCalloutLight</title>
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <rect width={18} height={1.3} x={11} y={12} fill="#AAB1BD" rx={0.65} />
      <rect width={18} height={5} x={11} y={15.8} fill="#AAB1BD" rx={2} />
      <rect width={18} height={5} x={11} y={15.8} stroke="#4D5664" rx={2} />
      <rect width={18} height={1.3} x={11} y={23.3} fill="#AAB1BD" rx={0.65} />
      <rect width={18} height={1.3} x={11} y={27.1} fill="#AAB1BD" rx={0.65} />
    </svg>
  );
};
