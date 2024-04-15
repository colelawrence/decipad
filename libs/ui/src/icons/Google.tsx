import type { SVGProps } from 'react';

export const Google = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Google</title>
      <g clipPath="url(#Google_svg__a)">
        <path
          fill="#4285F4"
          d="M13.71 8.131c0-.384-.035-.748-.093-1.103H8.124V9.22h3.145a2.708 2.708 0 0 1-1.167 1.74v1.459h1.877c1.099-1.016 1.73-2.513 1.73-4.288"
        />
        <path
          fill="#34A853"
          d="M8.124 13.833c1.575 0 2.892-.525 3.855-1.415l-1.877-1.458c-.525.35-1.19.564-1.978.564-1.522 0-2.81-1.026-3.272-2.411H2.917v1.502a5.825 5.825 0 0 0 5.207 3.218"
        />
        <path
          fill="#FBBC05"
          d="M4.852 9.113A3.385 3.385 0 0 1 4.668 8c0-.389.068-.763.184-1.113V5.385H2.918a5.766 5.766 0 0 0 0 5.23l1.934-1.502"
        />
        <path
          fill="#EA4335"
          d="M8.124 4.476c.86 0 1.628.296 2.236.875l1.662-1.663C11.016 2.745 9.7 2.167 8.124 2.167a5.825 5.825 0 0 0-5.207 3.218l1.935 1.502c.462-1.386 1.75-2.411 3.272-2.411"
        />
      </g>
      <defs>
        <clipPath id="Google_svg__a">
          <path fill="#fff" d="M2.167 2.167h11.667v11.667H2.167z" />
        </clipPath>
      </defs>
    </svg>
  );
};
