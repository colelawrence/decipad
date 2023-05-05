import { css } from '@emotion/react';
import { FC } from 'react';
import { useThemeFromStore } from '@decipad/react-contexts';
import { offBlack, transparency } from '../../primitives';
import { Anchor } from '../../utils';

interface OverlayProps {
  readonly closeAction?: string | (() => void);
}

export const Overlay = ({ closeAction }: OverlayProps): ReturnType<FC> => {
  const [isDarkMode] = useThemeFromStore();

  const styles = css({
    cursor: 'unset',
    backgroundColor: transparency(offBlack, isDarkMode ? 0.5 : 0.16).rgba,
  });

  return typeof closeAction === 'string' ? (
    <Anchor css={styles} aria-label="Close" href={closeAction}>
      {
        null // Yes, we really want this link to be empty, it has an aria-label instead
      }
    </Anchor>
  ) : (
    <button
      css={styles}
      aria-label="Close"
      disabled={!closeAction}
      onClick={closeAction}
    />
  );
};
