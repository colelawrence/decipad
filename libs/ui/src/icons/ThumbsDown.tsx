import type { SVGProps } from 'react';

export const ThumbsDown = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>ThumbsDown</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        d="M6.903 9.5v2c0 .398.16.78.447 1.06.286.282.673.44 1.077.44l2.033-4.5V3H4.729a1.03 1.03 0 0 0-.67.238 1 1 0 0 0-.346.612l-.701 4.5a.99.99 0 0 0 .237.806 1.01 1.01 0 0 0 .779.344zM10.46 3h1.524c.27 0 .528.105.718.293.19.187.298.442.298.707v3.5c0 .265-.107.52-.298.707-.19.188-.449.293-.718.293H10.46"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M10.46 3h1.524c.27 0 .528.105.718.293.19.187.298.442.298.707v3.5c0 .265-.107.52-.298.707-.19.188-.449.293-.718.293H10.46m-3.557 1v2c0 .398.16.78.447 1.06.286.282.673.44 1.077.44l2.033-4.5V3H4.729a1.03 1.03 0 0 0-.67.238 1 1 0 0 0-.346.612l-.701 4.5a.99.99 0 0 0 .237.806 1.01 1.01 0 0 0 .779.344z"
      />
    </svg>
  );
};
