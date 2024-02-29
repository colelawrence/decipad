import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandH1Light = ({
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
        fill="#4D5664"
        d="M11.254 26.5V14.136h1.497v5.506h6.592v-5.506h1.498V26.5h-1.498v-5.53h-6.592v5.53h-1.497M27.967 14.136V26.5H26.47V15.706h-.072l-3.019 2.004V16.19l3.091-2.053h1.497"
      />
    </svg>
  );
};
