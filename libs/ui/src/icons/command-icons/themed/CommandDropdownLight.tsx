import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandDropdownLight = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <rect
        width={20.7}
        height={6.7}
        x={9.65}
        y={11.65}
        fill="#fff"
        stroke="#4D5664"
        strokeWidth={1.3}
        rx={2.35}
      />
      <path
        fill="#fff"
        stroke="#4D5664"
        strokeWidth={1.3}
        d="M22.65 11.65H28A2.35 2.35 0 0 1 30.35 14v2A2.35 2.35 0 0 1 28 18.35h-5.35z"
      />
      <rect width={7} height={1} x={13} y={14.5} fill="#AAB1BD" rx={0.5} />
      <rect width={18} height={1.3} x={11} y={23} fill="#4D5664" rx={0.65} />
      <rect width={18} height={1.3} x={11} y={28.3} fill="#AAB1BD" rx={0.65} />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        d="m25.5 15.5.859-.859a.2.2 0 0 1 .282 0l.859.859"
      />
    </svg>
  );
};
