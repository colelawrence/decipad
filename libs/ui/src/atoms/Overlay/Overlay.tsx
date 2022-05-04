import { css } from '@emotion/react';
import { FC } from 'react';
import { offBlack, transparency } from '../../primitives';
import { Anchor } from '../../utils';

const styles = css({
  cursor: 'unset',
  backgroundColor: transparency(offBlack, 0.16).rgba,
});

interface OverlayProps {
  readonly closeAction?: string | (() => void);
}

export const Overlay = ({ closeAction }: OverlayProps): ReturnType<FC> => {
  return typeof closeAction === 'string' ? (
    <Anchor css={styles} aria-label="Close" href={closeAction} />
  ) : (
    <button
      css={styles}
      aria-label="Close"
      disabled={!closeAction}
      onClick={closeAction}
    />
  );
};
