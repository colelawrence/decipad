import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar } from '../../primitives';
import { noop } from '../../utils';

const styles = css({
  borderRadius: '100vmax',
  backgroundColor: cssVar('highlightColor'),
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

interface IconButtonProps {
  readonly children: ReactNode;
  readonly roundedSquare?: boolean;
  readonly onClick?: () => void;
}

export const IconButton = ({
  children,
  roundedSquare = false,
  onClick = noop,
}: IconButtonProps): ReturnType<FC> => {
  return (
    <button
      css={[styles, roundedSquare && roundedSquareStyles]}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
    >
      <span css={iconStyles}>{children}</span>
    </button>
  );
};
