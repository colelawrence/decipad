import type { SVGProps } from 'react';

export const Book = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      role="img"
      {...props}
    >
      <title>Book</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M12.833 3.833a.667.667 0 0 0-.666-.667H9.333C8.597 3.167 8 3.764 8 4.5v8.333l.552-.552c.5-.5 1.179-.781 1.886-.781h1.729a.667.667 0 0 0 .666-.667zM3.167 3.833c0-.368.298-.667.666-.667h2.834C7.403 3.167 8 3.764 8 4.5v8.333l-.552-.552c-.5-.5-1.179-.781-1.886-.781H3.833a.667.667 0 0 1-.667-.667z"
      />
    </svg>
  );
};
