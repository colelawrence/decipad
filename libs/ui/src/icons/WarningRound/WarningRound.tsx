import { FC } from 'react';
import { cssVar } from '../../primitives';

export const WarningRound: FC<{ variant?: 'default' | 'warning' }> = ({
  variant = 'default',
}) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Warning Round</title>
    <path
      d="M7.8335 13.8335C11.4233 13.8335 14.3335 10.9233 14.3335 7.3335C14.3335 3.74364 11.4233 0.833496 7.8335 0.833496C4.24364 0.833496 1.3335 3.74364 1.3335 7.3335C1.3335 10.9233 4.24364 13.8335 7.8335 13.8335Z"
      fill={variant === 'default' ? cssVar('iconBackground') : 'transparent'}
      stroke={
        variant === 'default'
          ? cssVar('iconColorHeavy')
          : cssVar('stateDangerIconOutline')
      }
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.99977 4.01611C8.457 4.01611 8.82766 4.38677 8.82766 4.84401V6.49979C8.82766 6.95703 8.457 7.32769 7.99977 7.32769C7.54254 7.32769 7.17188 6.95703 7.17188 6.49979V4.84401C7.17188 4.38677 7.54254 4.01611 7.99977 4.01611Z"
      fill={
        variant === 'default'
          ? cssVar('iconColorHeavy')
          : cssVar('stateDangerIconOutline')
      }
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.82766 9.81129C8.82766 10.2685 8.457 10.6392 7.99977 10.6392C7.54254 10.6392 7.17188 10.2685 7.17188 9.81129C7.17188 9.35406 7.54254 8.9834 7.99977 8.9834C8.457 8.9834 8.82766 9.35406 8.82766 9.81129Z"
      fill={
        variant === 'default'
          ? cssVar('iconColorHeavy')
          : cssVar('stateDangerIconOutline')
      }
    />
  </svg>
);
