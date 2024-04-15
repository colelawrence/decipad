import type { SVGProps } from 'react';

export const CommandBarLight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandBarLight</title>
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <path
        fill="#ECF0F6"
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M14.225 15.875H13.4c-.911 0-1.65.575-1.65 1.283v7.059c0 .709.739 1.283 1.65 1.283h.825c.911 0 1.65-.575 1.65-1.283v-7.059c0-.708-.739-1.283-1.65-1.283M20.55 11.75h-.826c-.911 0-1.65.535-1.65 1.196v11.358c0 .66.739 1.196 1.65 1.196h.825c.912 0 1.65-.535 1.65-1.196V12.946c0-.66-.739-1.196-1.65-1.196"
      />
      <path
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M11.75 28.25h16.5"
      />
      <path
        fill="#fff"
        stroke="#4D5664"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
        d="M26.6 15.875h-.825c-.911 0-1.65.575-1.65 1.283v7.059c0 .709.739 1.283 1.65 1.283h.825c.911 0 1.65-.575 1.65-1.283v-7.059c0-.708-.739-1.283-1.65-1.283"
      />
    </svg>
  );
};
