import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Coffee = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5.75 10.225v5.025m0 0h-1m1 0h1m0 0v4h10.5v-4m-10.5 0h10.5m1 0v-5.025m0 5.025h1m-1 0h-1M4.75 8 6 4.75h12L19.25 8v1c0 .69-.56 1.25-1.25 1.25S16.5 9.69 16.5 9c0 .69-.81 1.25-1.5 1.25S13.5 9.69 13.5 9c0 .69-.81 1.25-1.5 1.25S10.5 9.69 10.5 9c0 .69-.81 1.25-1.5 1.25S7.5 9.69 7.5 9c0 .69-.81 1.25-1.5 1.25S4.75 9.69 4.75 9z"
      />
    </svg>
  );
};
