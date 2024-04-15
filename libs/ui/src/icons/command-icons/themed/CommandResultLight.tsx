import type { SVGProps } from 'react';

export const CommandResultLight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandResultLight</title>
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <rect
        width={18.7}
        height={13.7}
        x={10.65}
        y={11.65}
        fill="#fff"
        stroke="#4D5664"
        strokeWidth={1.3}
        rx={3.35}
      />
      <rect
        width={8.7}
        height={8.7}
        x={15.65}
        y={20.65}
        fill="#fff"
        rx={4.35}
      />
      <rect
        width={8.7}
        height={8.7}
        x={15.65}
        y={20.65}
        stroke="#4D5664"
        strokeWidth={1.3}
        rx={4.35}
      />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeWidth={1.3}
        d="M15.714 25.214h5.715m0 0-1.147-1.428m1.147 1.428-1.147 1.429"
      />
      <rect
        width={8}
        height={1}
        x={14}
        y={14}
        fill="#AAB1BD"
        rx={0.5}
        transform="rotate(90 14 14)"
      />
    </svg>
  );
};
