import { cursorStore } from '@decipad/react-contexts';
import { RemoteAvatarOverlay as UIRemoteAvatarOverlay } from '@decipad/ui';
import { ErrorBoundary } from '@sentry/react';
import { ComponentProps, FC, RefObject } from 'react';
import { RemoteAvatar } from './RemoteAvatar';

interface RemoteAvatarOverlayProps {
  containerRef: RefObject<HTMLElement>;
  tabIndex: number;
}

export const RemoteAvatarOverlay: FC<RemoteAvatarOverlayProps> = ({
  containerRef,
  tabIndex,
}) => {
  // eslint-disable-next-line no-underscore-dangle
  const _cursors = cursorStore.use.cursors();
  const cursors = Array.isArray(_cursors)
    ? _cursors
        .filter((c) => c.data.anchor.path[0] === tabIndex)
        .map((c) => ({
          ...c,
          selection: {
            anchor: {
              path: c.selection.anchor.path.slice(1),
              offset: c.selection.anchor.offset,
            },
            focus: {
              path: c.selection.focus.path.slice(1),
              offset: c.selection.focus.offset,
            },
          },
          data: {
            ...c.data,
            anchor: {
              path: c.data.anchor.path.slice(1),
              offset: c.data.anchor.offset,
            },
            focus: {
              path: c.data.focus.path.slice(1),
              offset: c.data.focus.offset,
            },
          },
        }))
    : {};

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
