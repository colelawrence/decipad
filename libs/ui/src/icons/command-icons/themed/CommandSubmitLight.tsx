import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandSubmitLight = ({
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
        width={18.7}
        height={13.7}
        x={10.65}
        y={13.15}
        fill="#fff"
        stroke="#4D5664"
        strokeWidth={1.3}
        rx={3.35}
      />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m12 14 8 7 8-7"
      />
    </svg>
  );
};
