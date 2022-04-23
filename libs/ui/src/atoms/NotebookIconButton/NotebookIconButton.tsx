import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { black, grey200, setCssVar } from '../../primitives';

const buttonStyles = css({
  ...setCssVar('currentTextColor', black.rgb),
  width: '24px',
  height: '24px',
  borderRadius: '4px',
  backgroundColor: grey200.rgb,
  display: 'grid',
  placeItems: 'center',
});

const iconSize = css({
  display: 'inline-block',
  width: '22px',
  height: '22px',
});

type IconButtonProps = {
  readonly onClick?: () => void;
  readonly children: ReactNode;
  readonly ariaLabel?: string;
};

export const NotebookIconButton: FC<IconButtonProps> = ({
  children,
  onClick,
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      css={buttonStyles}
      onClick={onClick}
    >
      <span css={iconSize}>{children}</span>
    </button>
  );
};
