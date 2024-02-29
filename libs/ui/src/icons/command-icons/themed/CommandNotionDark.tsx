import type { SVGProps } from 'react';

interface SVGRProps {
  title?: string;
  titleId?: string;
}
export const CommandNotionDark = ({
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
      <rect width={40} height={40} fill="#29283A" rx={8} />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M27.25 15c0 1.105-3.384 2.25-7.25 2.25s-7.25-1.145-7.25-2.25 3.384-2.25 7.25-2.25 7.25 1.145 7.25 2.25M20.25 22.25c-3.866 0-7.5-1.145-7.5-2.25M27.25 20.25V15"
      />
      <path
        stroke="#9B9AAC"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20.25 27.25c-3.866 0-7.5-1.145-7.5-2.25V15"
      />
      <g clipPath="url(#CommandNotionDark_svg__a)">
        <path
          fill="#9B9AAC"
          d="m22.92 21.736 5.396-.381c.663-.055.833-.018 1.25.272l1.722 1.161c.284.2.379.254.379.472v6.37c0 .398-.152.634-.682.67l-6.266.363c-.398.018-.587-.036-.795-.29l-1.269-1.579c-.227-.29-.322-.508-.322-.762v-5.661c0-.327.152-.599.587-.635"
        />
        <path
          fill="#1B1A28"
          fillRule="evenodd"
          d="m28.316 21.355-5.396.38c-.435.037-.587.31-.587.636v5.661c0 .254.095.472.322.762l1.269 1.579c.208.254.398.308.795.29l6.266-.363c.53-.036.682-.272.682-.67v-6.37c0-.207-.085-.266-.336-.442l-.043-.03-1.722-1.161c-.417-.29-.587-.327-1.25-.272m-3.455 1.8c-.512.034-.628.041-.918-.185l-.739-.563c-.075-.073-.037-.163.152-.181l5.187-.363c.435-.037.662.109.833.236l.89.617c.037.018.132.127.018.127l-5.357.308-.066.005m-.596 6.42v-5.407c0-.237.075-.345.302-.364l6.153-.344c.208-.019.303.108.303.344v5.371c0 .236-.038.436-.38.454l-5.887.327c-.34.018-.491-.09-.491-.381m5.811-5.117c.038.163 0 .326-.17.345l-.284.054v3.992c-.246.127-.473.2-.663.2-.303 0-.378-.092-.605-.363l-1.856-2.795v2.704l.587.127s0 .326-.474.326l-1.305.073c-.038-.073 0-.254.132-.29l.341-.09v-3.575l-.473-.037a.342.342 0 0 1 .322-.418l1.4-.09 1.931 2.83v-2.503l-.492-.055c-.038-.2.114-.345.303-.363l1.306-.073"
          clipRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="CommandNotionDark_svg__a">
          <path fill="#fff" d="M22 21h10v10H22z" />
        </clipPath>
      </defs>
    </svg>
  );
};
