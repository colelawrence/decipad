import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandFormulaLight = ({
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
        strokeWidth={1.5}
        d="M14.773 24.695c.402 2.143 4.5 2.705 4.97-.71.299-2.186.258-5.316.57-7.593.129-.937.822-3.314 4.827-2.068M17 18h7"
      />
    </svg>
  );
};
