import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandCalloutDark = ({
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
      <rect width={18} height={1.3} x={11} y={12} fill="#6A6885" rx={0.65} />
      <rect width={18} height={5} x={11} y={15.8} fill="#6A6885" rx={2} />
      <rect width={18} height={5} x={11} y={15.8} stroke="#9B9AAC" rx={2} />
      <rect width={18} height={1.3} x={11} y={23.3} fill="#6A6885" rx={0.65} />
      <rect width={18} height={1.3} x={11} y={27.1} fill="#6A6885" rx={0.65} />
    </svg>
  );
};
