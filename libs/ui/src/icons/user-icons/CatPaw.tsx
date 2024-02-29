import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CatPaw = ({
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
        d="M14.625 13.33v-.03c0-1.408-1.175-2.55-2.625-2.55s-2.625 1.142-2.625 2.55v.03c-1.484.206-2.625 1.446-2.625 2.945 0 1.643 1.371 2.975 3.063 2.975.856 0 1.631-.342 2.187-.893.556.551 1.33.893 2.188.893 1.69 0 3.062-1.332 3.062-2.975 0-1.499-1.141-2.739-2.625-2.945M6 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
      />
    </svg>
  );
};
