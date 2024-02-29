import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const LightBulb = ({
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
        d="M12 4.75C8.5 4.75 6.75 7.5 6.75 10c0 4 3 4.5 3 6v2.25a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V16c0-1.5 3-2 3-6 0-2.5-1.75-5.25-5.25-5.25M10 16.75h4"
      />
    </svg>
  );
};
