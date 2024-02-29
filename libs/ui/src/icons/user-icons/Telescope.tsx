import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Telescope = ({
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
        d="m8.676 12.387.482.97a1 1 0 0 0 1.34.45L11 13.56m-2.324-1.172-.534-1.074a1 1 0 0 1 .34-1.277l7.915-5.286 2.853 4.726L11 13.558m-2.324-1.17L4.75 14.25m6.25-.691L7.75 19.25M11 13.559l3.25 5.691"
      />
    </svg>
  );
};
