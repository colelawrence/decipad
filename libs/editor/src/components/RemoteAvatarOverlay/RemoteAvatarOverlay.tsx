import { cursorStore } from '@decipad/react-contexts';
import { RemoteAvatarOverlay as UIRemoteAvatarOverlay } from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import { ComponentProps, FC, RefObject } from 'react';
import { RemoteAvatar } from './RemoteAvatar';

interface RemoteAvatarOverlayProps {
  containerRef: RefObject<HTMLElement>;
}

export const RemoteAvatarOverlay: FC<RemoteAvatarOverlayProps> = ({
  containerRef,
}) => {
  const cursors = cursorStore.use.cursors();
  return (
    <UIRemoteAvatarOverlay>
      {Object.entries(cursors)
        .filter(([cursorName]) => cursorName !== 'drag')
        .map(([key, cursor]) => (
          <ErrorBoundary key={key}>
            <RemoteAvatar
              key={key}
              containerRef={containerRef}
              cursor={cursor as ComponentProps<typeof RemoteAvatar>['cursor']}
            />
          </ErrorBoundary>
        ))}
    </UIRemoteAvatarOverlay>
  );
};
