import type { SVGProps } from 'react';

export const Heading = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Heading</title>
      <path
        fill="currentColor"
        d="M4.203 13.028V2.972h1.218V7.45h5.361V2.972H12v10.056h-1.218V8.53H5.421v4.498z"
      />
    </svg>
  );
};
