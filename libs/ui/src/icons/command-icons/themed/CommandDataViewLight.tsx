import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandDataViewLight = ({
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
        fill="#ECF0F6"
        stroke="#4D5664"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M22.8 11.25h-7c-1.4 0-2.1 0-2.635.273a2.5 2.5 0 0 0-1.093 1.092c-.272.535-.272 1.235-.272 2.635v4.5c0 1.4 0 2.1.272 2.635a2.5 2.5 0 0 0 1.093 1.092c.535.273 1.235.273 2.635.273h7c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.092-1.092c.273-.535.273-1.235.273-2.635v-4.5c0-1.4 0-2.1-.273-2.635a2.5 2.5 0 0 0-1.092-1.092c-.535-.273-1.235-.273-2.635-.273Z"
      />
      <path
        stroke="#4D5664"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M16.8 11.25v12.5M26.8 17.5h-15M21.8 11.25v12.5"
      />
      <path
        fill="#fff"
        stroke="#AAB1BD"
        strokeWidth={1.3}
        d="m29.365 20.134-7.704 3.93a.4.4 0 0 0 .119.752l3.401.542a.4.4 0 0 1 .302.23l1.73 3.842a.4.4 0 0 0 .755-.077l1.97-8.775a.4.4 0 0 0-.573-.444Z"
      />
    </svg>
  );
};
