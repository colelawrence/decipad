import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandInputDark = ({
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
      <rect width={40} height={40} fill="#29283A" rx={8} />
      <rect
        width={18.7}
        height={13.7}
        x={10.65}
        y={13.65}
        fill="#1B1A28"
        stroke="#9B9AAC"
        strokeWidth={1.3}
        rx={3.35}
      />
      <rect
        width={8}
        height={1}
        x={14}
        y={16.5}
        fill="#6A6885"
        rx={0.5}
        transform="rotate(90 14 16.5)"
      />
    </svg>
  );
};
