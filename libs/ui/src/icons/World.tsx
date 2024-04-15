import type { SVGProps } from 'react';

export const World = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>World</title>
      <path
        fill="currentColor"
        fillOpacity={0.1}
        d="M6.25 2.75 3.625 4.938 4.5 7.124h.875l.875-.875L8 5.813l.875-.438.875-1.312v-.875zM10.625 8.875l1.313.875.874.438-.437.874-.875.876-.875.874-2.187.438v-.875L8 11.5l-.875-.875.438-1.312L8 8.437h1.313z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 13.25a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12.714 10.319-2.97-1.827a.394.394 0 0 0-.169-.06l-1.252-.17a.427.427 0 0 0-.454.258l-.75 1.679a.438.438 0 0 0 .077.475l1.028 1.11a.449.449 0 0 1 .11.383L8.12 13.25"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.555 4.04 4.062 5.2a.437.437 0 0 0-.005.323l.629 1.673a.432.432 0 0 0 .317.28l1.17.25a.427.427 0 0 1 .301.236l.208.432a.449.449 0 0 0 .394.246h.738"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.34 2.92.508.918a.443.443 0 0 1-.087.536L8.29 5.704a.394.394 0 0 1-.082.06l-.673.371a.47.47 0 0 1-.208.055h-1.17a.443.443 0 0 0-.405.268l-.454 1.077"
      />
    </svg>
  );
};
