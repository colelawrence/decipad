import { css } from '@emotion/react';
import { FC, PropsWithChildren } from 'react';
import { slimBlockWidth } from '../../styles/editor-layout';
import { smallestDesktop } from '../../primitives';

const remoteAvatarOverlayWrapperStyles = css({
  position: 'absolute',
  top: 0,
  left: 0,
  marginTop: '0px',
  width: 'calc(100%)',
  height: '100%',
});

const remoteAvatarOverlayStyles = css({
  position: 'relative',
  maxWidth: slimBlockWidth,
  margin: '0 auto',
  height: '100%',
  zIndex: 0,
});

const mobileQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const invisibleOnSmallScreens = css({
  [mobileQuery]: {
    display: 'none',
  },
});

export const RemoteAvatarOverlay: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div css={[invisibleOnSmallScreens, remoteAvatarOverlayWrapperStyles]}>
      <div css={remoteAvatarOverlayStyles}>{children}</div>
    </div>
  );
};
