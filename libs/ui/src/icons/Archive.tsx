import type { SVGProps } from 'react';

export const Archive = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Archive</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M12.167 5.833H3.834l.552 5.793c.065.684.64 1.207 1.327 1.207h4.575c.688 0 1.262-.523 1.328-1.207l.551-5.793"
      />
      <path
        fill="currentColor"
        fillOpacity={0.1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M12.833 3.834a.667.667 0 0 0-.667-.667H3.833a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h8.333a.667.667 0 0 0 .667-.667V3.834"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M6.5 8.833h3"
      />
    </svg>
  );
};
