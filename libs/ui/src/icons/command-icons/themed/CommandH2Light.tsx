import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandH2Light = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <path
        fill="#4D5664"
        d="M10.559 26V13.636h1.497v5.506h6.592v-5.506h1.497V26h-1.497v-5.53h-6.592V26h-1.497m12.366 0v-1.087l4.081-4.467c.48-.523.874-.978 1.183-1.364.31-.39.54-.757.689-1.099.153-.346.23-.708.23-1.087 0-.434-.105-.81-.315-1.129a2.037 2.037 0 0 0-.845-.736 2.74 2.74 0 0 0-1.207-.26c-.475 0-.89.099-1.244.296-.35.193-.622.465-.815.815-.19.35-.284.76-.284 1.232h-1.424c0-.725.167-1.36.5-1.908a3.481 3.481 0 0 1 1.365-1.28c.58-.306 1.23-.459 1.95-.459.724 0 1.366.153 1.926.46.56.305.998.718 1.316 1.237.318.519.477 1.096.477 1.732 0 .455-.083.9-.248 1.334-.16.431-.443.912-.845 1.443-.398.528-.952 1.172-1.66 1.932l-2.777 2.97v.097h5.747V26h-7.8"
      />
    </svg>
  );
};
