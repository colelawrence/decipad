import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandSqlLight = ({
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
      <g clipPath="url(#CommandSQLLight_svg__a)">
        <path
          stroke="#4D5664"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M27.25 15c0 1.105-3.384 2.25-7.25 2.25s-7.25-1.145-7.25-2.25 3.384-2.25 7.25-2.25 7.25 1.145 7.25 2.25M20.25 22.25c-3.866 0-7.5-1.145-7.5-2.25M27.25 20.25V15"
        />
        <path
          stroke="#4D5664"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20.25 27.25c-3.866 0-7.5-1.145-7.5-2.25V15"
        />
        <path
          fill="#fff"
          stroke="#AAB1BD"
          strokeWidth={1.3}
          d="m23.217 22.266.571 7.066a.4.4 0 0 0 .74.177l1.427-2.332a.4.4 0 0 1 .328-.191l3.393-.109a.4.4 0 0 0 .217-.727l-6.047-4.243a.4.4 0 0 0-.629.36Z"
        />
      </g>
      <defs>
        <clipPath id="CommandSQLLight_svg__a">
          <path fill="#fff" d="M8 8h24v24H8z" />
        </clipPath>
      </defs>
    </svg>
  );
};
