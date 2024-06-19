import type { SVGProps } from 'react';

export const CommandDateLight = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      role="img"
      {...props}
    >
      <title>CommandDateLight</title>
      <rect width={40} height={40} fill="#ECF0F6" rx={8} />
      <path
        fill="#fff"
        stroke="#4D5664"
        strokeWidth={1.3}
        d="M15.85 10.5v1.85h-1.7V10.5a.85.85 0 0 1 1.7 0ZM25.85 10.5v1.85h-1.7V10.5a.85.85 0 0 1 1.7 0Z"
      />
      <rect
        width={17.7}
        height={17.7}
        x={11.15}
        y={11.65}
        fill="#fff"
        stroke="#4D5664"
        strokeWidth={1.3}
        rx={3.35}
      />
      <path
        fill="#ECF0F6"
        stroke="#4D5664"
        strokeWidth={1.3}
        d="M14.5 11.65h11c1.85 0 3.35 1.5 3.35 3.35v1.35h-17.7V15c0-1.85 1.5-3.35 3.35-3.35Z"
      />
      <path
        fill="#AAB1BD"
        d="M16.03 25v-.645l1.737-1.68q.25-.248.416-.44.166-.193.249-.373a.9.9 0 0 0 .083-.386.7.7 0 0 0-.107-.4.7.7 0 0 0-.296-.26 1 1 0 0 0-.428-.091.9.9 0 0 0-.433.101.7.7 0 0 0-.288.282.9.9 0 0 0-.1.436H16q0-.47.218-.817a1.46 1.46 0 0 1 .598-.537q.385-.19.88-.19.503 0 .885.186.38.185.592.508.212.322.212.737 0 .277-.107.544a2.3 2.3 0 0 1-.38.592q-.268.326-.754.788l-.863.865v.033h2.18V25zM20.106 24.085v-.71l2.124-3.308h.602v1.012h-.367l-1.43 2.233v.038H24v.735zm2.388.915v-1.132l.01-.318v-3.483h.856V25z"
      />
    </svg>
  );
};
