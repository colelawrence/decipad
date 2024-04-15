import type { SVGProps } from 'react';

export const Replicate = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Replicate</title>
      <mask
        id="Replicate_svg__a"
        width={12}
        height={12}
        x={2}
        y={2}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: 'luminance',
        }}
      >
        <path fill="#fff" d="M14 2H2v12h12z" />
      </mask>
      <g fill="currentColor" mask="url(#Replicate_svg__a)">
        <path d="M14 7.131v1.356H9.24V14H7.724V7.131H14" />
        <path d="M14 4.566v1.358H6.377V14H4.86V4.566H14Z" />
        <path d="M14 2v1.358H3.517V14H2V2z" />
      </g>
    </svg>
  );
};
