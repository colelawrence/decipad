import { cursorStore, useTabEditorContext } from '@decipad/react-contexts';
import { RemoteAvatarOverlay as UIRemoteAvatarOverlay } from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import type { FC, RefObject } from 'react';
import { RemoteAvatar } from './RemoteAvatar';

interface RemoteAvatarOverlayProps {
  containerRef: RefObject<HTMLElement>;
}

export const RemoteAvatarOverlay: FC<RemoteAvatarOverlayProps> = ({
  containerRef,
}) => {
  const { tabIndex } = useTabEditorContext();
  const cursors = cursorStore.use.userCursorsForTab(tabIndex);

  return (
    <UIRemoteAvatarOverlay>
      {Object.entries(cursors)
        .filter(([cursorName]) => cursorName !== 'drag')
        .map(([key, cursor]) => (
          <ErrorBoundary key={key}>
            <RemoteAvatar
              key={key}
              containerRef={containerRef}
              cursor={cursor}
            />
          </ErrorBoundary>
        ))}
    </UIRemoteAvatarOverlay>
  );
};
