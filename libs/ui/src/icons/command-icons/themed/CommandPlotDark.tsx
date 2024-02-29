import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandPlotDark = ({
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
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.75 11.75v16.5h16.5"
      />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M24.125 22.75a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75"
      />
      <path
        fill="#1B1A28"
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M20 20a1.375 1.375 0 1 0 0-2.75A1.375 1.375 0 0 0 20 20"
      />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M15.875 24.125a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75"
      />
      <path
        fill="#1B1A28"
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M26.375 17.25a1.375 1.375 0 1 0 0-2.75 1.375 1.375 0 0 0 0 2.75"
      />
    </svg>
  );
};
