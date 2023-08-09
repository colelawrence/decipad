import { FC } from 'react';
import { cssVar, offBlack } from '../../primitives';

export const Play: FC<{ variant?: 'default' | 'black' }> = ({
  variant = 'default',
}) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Play</title>
    <path
      d="M9.90595 9.83109L7.02723 11.8631C6.04815 12.5542 5.55861 12.8998 5.15084 12.8831C4.79579 12.8685 4.46545 12.6974 4.24881 12.4157C4 12.0922 4 11.493 4 10.2946L4 5.97647C4 4.70269 4 4.06581 4.26134 3.73768C4.48864 3.4523 4.83343 3.28582 5.19827 3.28529C5.61776 3.28469 6.11651 3.68076 7.11401 4.47289L9.99274 6.75894C10.6736 7.29962 11.014 7.56996 11.1293 7.89294C11.2303 8.17583 11.2216 8.48632 11.1048 8.76306C10.9714 9.07901 10.6163 9.32971 9.90595 9.83109Z"
      fill={variant === 'default' ? cssVar('iconColorHeavy') : offBlack.hex}
    />
  </svg>
);
