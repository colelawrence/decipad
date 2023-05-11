import { css } from '@emotion/react';
import { FC, PropsWithChildren } from 'react';
import { smallScreenQuery } from '../../primitives';
import { slimBlockWidth } from '../../styles/editor-layout';

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

const invisibleOnSmallScreens = css({
  [smallScreenQuery]: {
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
