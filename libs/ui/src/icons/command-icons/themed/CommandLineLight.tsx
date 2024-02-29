import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandLineLight = ({
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
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.75 11.75v16.5h16.5"
      />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m27 15.5-4.097 6.933-3.361-3.385-4.355 5.077"
      />
    </svg>
  );
};
