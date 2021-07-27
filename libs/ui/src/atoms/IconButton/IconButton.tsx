import { css } from '@emotion/react';
import { ReactNode, FC } from 'react';
import { cssVar } from '../../primitives';
import { noop } from '../../utils';

const styles = css({
  borderRadius: '6px',
  backgroundColor: cssVar('highlightColor'),
});
const iconStyles = css({
  display: 'flex',
  maxWidth: '32px',
  maxHeight: '32px',
  padding: `20%`,
});

interface IconButtonProps {
  readonly children: ReactNode;
  readonly onClick?: () => void;
}

export const IconButton = ({
  children,
  onClick = noop,
}: IconButtonProps): ReturnType<FC> => {
  return (
    <button css={styles} onClick={onClick}>
      <span css={iconStyles}>{children}</span>
    </button>
  );
};
