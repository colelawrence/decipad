import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandQuoteDark = ({
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
        fill="#1B1A28"
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M19.25 19.25a2 2 0 0 1-2 2h-2.5a2 2 0 0 1-2-2v-2.186a3 3 0 0 1 .965-2.205L16 12.75v3h1.25a2 2 0 0 1 2 2z"
      />
      <path
        fill="#9B9AAC"
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M27.25 25.25a2 2 0 0 1-2 2h-2.5a2 2 0 0 1-2-2v-2.186a3 3 0 0 1 .965-2.205L24 18.75v3h1.25a2 2 0 0 1 2 2z"
      />
    </svg>
  );
};
