import type { SVGProps } from 'react';

export const Message = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      {...props}
    >
      <title>Message</title>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 18.25c3.866 0 7.25-2.095 7.25-6.75S15.866 4.75 12 4.75 4.75 6.845 4.75 11.5c0 1.768.488 3.166 1.305 4.22.239.31.334.72.168 1.073q-.151.323-.315.615c-.454.816.172 2.005 1.087 1.822 1.016-.204 2.153-.508 3.1-.956.198-.094.418-.13.635-.103q.624.08 1.27.079"
      />
    </svg>
  );
};
