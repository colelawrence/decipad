import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandQuoteLight = ({
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
      <path
        fill="#fff"
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M19.25 19.25a2 2 0 0 1-2 2h-2.5a2 2 0 0 1-2-2v-2.186a3 3 0 0 1 .965-2.205L16 12.75v3h1.25a2 2 0 0 1 2 2z"
      />
      <path
        fill="#AAB1BD"
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M27.25 25.25a2 2 0 0 1-2 2h-2.5a2 2 0 0 1-2-2v-2.186a3 3 0 0 1 .965-2.205L24 18.75v3h1.25a2 2 0 0 1 2 2z"
      />
    </svg>
  );
};
