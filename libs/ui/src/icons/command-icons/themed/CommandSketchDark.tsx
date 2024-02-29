import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandSketchDark = ({
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
      <g clipPath="url(#CommandSketchDark_svg__a)">
        <path fill="#1B1A28" d="m14 18.5 4.496-4.497 2 3.5-3 3z" />
        <path
          stroke="#9B9AAC"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.3}
          d="M14 29.32c4.928-4.475 10.766 3.35 15.615-2.944"
        />
        <path
          stroke="#6A6885"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.3}
          d="M21.002 25.166c2.452 1.05 4.327 1.546 6.138-.805"
        />
        <path
          stroke="#9B9AAC"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.3}
          d="m15.363 10.384 4.246 4.246 1.758 6.736-6.736-1.757-4.247-4.246"
        />
        <path
          stroke="#9B9AAC"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.3}
          d="M20.488 18.437s-.879-.586-1.757.293c-.879.878-.293 1.757-.293 1.757M13.752 18.437l4.686-4.685"
        />
      </g>
      <defs>
        <clipPath id="CommandSketchDark_svg__a">
          <path fill="#fff" d="M8 8h24v24H8z" />
        </clipPath>
      </defs>
    </svg>
  );
};
