import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandInputLight = ({
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
        y={13.65}
        fill="#fff"
        stroke="#4D5664"
        strokeWidth={1.3}
        rx={3.35}
      />
      <rect
        width={8}
        height={1}
        x={14}
        y={16.5}
        fill="#AAB1BD"
        rx={0.5}
        transform="rotate(90 14 16.5)"
      />
    </svg>
  );
};
