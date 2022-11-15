import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { Anchor } from '../../utils';
import { useMouseEventNoEffect } from '../../utils/useMouseEventNoEffect';

const styles = css({
  display: 'inline-block',
  borderRadius: '100vmax',
  backgroundColor: cssVar('highlightColor'),

  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
  },
});
const roundedSquareStyles = css({
  borderRadius: '6px',
});

const iconStyles = css({
  display: 'flex',
  flexDirection: 'column',

  minWidth: '16px',
  minHeight: '16px',
  maxWidth: '32px',
  maxHeight: '32px',

  padding: `20%`,
});

type IconButtonProps = {
  readonly children: ReactNode;
  readonly roundedSquare?: boolean;
  readonly roleDescription?: string;
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

  onClick,
  href,
}: IconButtonProps): ReturnType<FC> => {
  const onButtonClick = useMouseEventNoEffect(onClick);
  return onClick ? (
    <button
      aria-roledescription={roleDescription}
      css={[styles, roundedSquare && roundedSquareStyles]}
      onClick={onButtonClick}
    >
      <span css={iconStyles}>{children}</span>
    </button>
  ) : (
    <Anchor
      href={href}
      css={css([styles, roundedSquare && roundedSquareStyles])}
    >
      <span css={iconStyles}>{children}</span>
    </Anchor>
  );
};
