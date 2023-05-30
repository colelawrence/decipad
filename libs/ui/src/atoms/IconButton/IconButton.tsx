/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import {
  mainIconButtonStyles,
  roundedSquareStyles,
} from '../../styles/buttons';
import { Anchor } from '../../utils';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

type IconButtonProps = {
  readonly children: ReactNode;
  readonly roundedSquare?: boolean;
  readonly roleDescription?: string;
  readonly transparent?: boolean;
} & (
  | {
      readonly href: string;
      readonly onClick?: undefined;
    }
  | {
      readonly onClick: () => void;
      readonly href?: undefined;
    }
);

export const IconButton = ({
  children,
  roundedSquare = false,
  roleDescription = 'button',
  transparent = false,

  onClick,
  href,
}: IconButtonProps): ReturnType<FC> => {
  const onButtonClick = useEventNoEffect(onClick);
  return onClick ? (
    <button
      aria-roledescription={roleDescription}
      css={[
        mainIconButtonStyles,
        roundedSquare && roundedSquareStyles,
        transparent && { backgroundColor: 'transparent' },
      ]}
      onClick={onButtonClick}
    >
      <span css={iconStyles}>{children}</span>
    </button>
  ) : (
    <Anchor
      href={href}
      css={css([
        mainIconButtonStyles,
        roundedSquare && roundedSquareStyles,
        transparent && { backgroundColor: 'transparent' },
      ])}
    >
      <span css={iconStyles}>{children}</span>
    </Anchor>
  );
};

const iconStyles = css({
  display: 'flex',
  flexDirection: 'column',

  minWidth: '16px',
  minHeight: '16px',
  maxWidth: '32px',
  maxHeight: '32px',

  padding: `20%`,
});
