import type { SVGProps } from 'react';

export const Party = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Party</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m8.89 9.281-4.017 8.513c-.427.834.426 1.744 1.287 1.373l8.442-2.98"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.32 10.977c1.64 1.893 2.378 4.108 1.65 4.949-.73.84-2.65-.011-4.29-1.903-1.64-1.892-2.378-4.108-1.65-4.949.73-.84 2.65.011 4.29 1.903M9.5 17.637c-.597-.382-1.226-.93-1.82-1.614-.39-.45-.73-.92-1.01-1.384"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.5 5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m15.75 9.25.129-.129a3 3 0 0 0 0-4.242l-.129-.129M17 13l.293-.293a1 1 0 0 1 1.414 0L19 13"
      />
    </svg>
  );
};
