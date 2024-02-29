import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const Virus = ({
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
        d="M16.25 12a4.25 4.25 0 1 1-8.5 0 4.25 4.25 0 0 1 8.5 0M10.75 4.75h2.5M10.75 19.25h2.5M12 5v2.25M12 16.75V19M16.243 5.99l1.767 1.767M5.99 16.243l1.768 1.767M16.95 7.05l-1.591 1.591M8.641 15.359l-1.59 1.59M19.25 10.75v2.5M4.75 10.75v2.5M19 12h-2.25M7.25 12H5M18.01 16.243l-1.767 1.767M7.758 5.99 5.99 7.757M16.95 16.95l-1.591-1.591M8.641 8.641l-1.59-1.59"
      />
    </svg>
  );
};
