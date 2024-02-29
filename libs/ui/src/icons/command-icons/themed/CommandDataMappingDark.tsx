import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandDataMappingDark = ({
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
        height={16.7}
        x={10.65}
        y={11.65}
        fill="#29283A"
        stroke="#9B9AAC"
        strokeWidth={1.3}
        rx={3.35}
      />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.875 21.25h-1.842c-1.744 0-3.158 1.612-3.158 3.6V25"
      />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21.25 20 1.25 1.25-1.25 1.25"
      />
      <path
        fill="#1B1A28"
        stroke="#9B9AAC"
        strokeWidth={1.3}
        d="M14 11.65h12c1.85 0 3.35 1.5 3.35 3.35v1.35h-18.7V15c0-1.85 1.5-3.35 3.35-3.35Z"
      />
    </svg>
  );
};
