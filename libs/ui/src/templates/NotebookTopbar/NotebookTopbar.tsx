import { docs, workspaces } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useSession } from 'next-auth/react';
import { ComponentProps, FC, useContext, useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { ClientEventsContext } from '../../../../client-events/src';
import { Button, IconButton } from '../../atoms';
import { LeftArrow } from '../../icons';
import { NotebookAvatars, NotebookPath } from '../../molecules';
import { NotebookSharingPopUp } from '../../organisms';
import { cssVar, p14Medium, smallestDesktop } from '../../primitives';
import { PermissionType } from '../../types';
import { Anchor } from '../../utils';

const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const wrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  rowGap: '8px',

  padding: '16px 0',

  borderBottom: '1px solid',
  borderColor: cssVar('highlightColor'),
});

const leftSideStyles = css({
  flex: 1,

  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',

  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const rightSideStyles = css({
  display: 'grid',
  gridTemplateColumns: '1fr max-content max-content',
  alignItems: 'center',
  gap: '1rem',
  marginRight: '-1rem',
  marginLeft: '1rem',
});

const linksStyles = css({
  display: 'flex',
  gap: '12px',
  [smallScreenQuery]: {
    display: 'none',
  },
});
const helpLinkStyles = css(p14Medium);

export type NotebookTopbarProps = Pick<
  ComponentProps<typeof NotebookAvatars>,
  'usersWithAccess'
> &
  ComponentProps<typeof NotebookSharingPopUp> & {
    permission?: PermissionType | null;
    workspace?: { id: string; name: string } | null;
    onDuplicateNotebook?: () => void;
    onRevertChanges?: () => void;
    hasLocalChanges?: BehaviorSubject<boolean>;
  };

export const NotebookTopbar = ({
  workspace,
  notebook,
  onDuplicateNotebook = noop,
  onRevertChanges = noop,
  usersWithAccess,
  permission,
  hasLocalChanges: hasLocalChanges$,
  ...sharingProps
}: NotebookTopbarProps): ReturnType<FC> => {
  const { status: sessionStatus } = useSession();
  const isWriter = permission === 'ADMIN' || permission === 'WRITE';
  const clientEvent = useContext(ClientEventsContext);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  useEffect(() => {
    const subscription = hasLocalChanges$?.subscribe(setHasLocalChanges);
    return () => {
      subscription?.unsubscribe();
    };
  }, [hasLocalChanges$]);

  return (
    <div css={wrapperStyles}>
      {/* Left side */}
      <div css={leftSideStyles}>
        {isWriter && workspace && (
          <div css={{ width: '32px', display: 'grid' }}>
            <IconButton
              href={workspaces({}).workspace({ workspaceId: workspace.id }).$}
            >
              <LeftArrow />
            </IconButton>
          </div>
        )}
        <NotebookPath notebookName={notebook.name} />
      </div>

      {/* Right side */}
      <div css={rightSideStyles}>
        {isWriter && (
          <div css={linksStyles}>
            <em css={helpLinkStyles}>
              <Anchor
                href={docs({}).page({ name: 'get-inspiration' }).$}
                // Analytics
                onClick={() =>
                  clientEvent({
                    type: 'action',
                    action: 'notebook get inspiration link clicked',
                  })
                }
              >
                Gallery
              </Anchor>
            </em>
            <em css={helpLinkStyles}>
              <Anchor
                href={docs({}).$}
                // Analytics
                onClick={() =>
                  clientEvent({
                    type: 'action',
                    action: 'notebook help link clicked',
                  })
                }
              >
                Help
              </Anchor>
            </em>
          </div>
        )}
        <NotebookAvatars usersWithAccess={usersWithAccess} />

        {!isWriter && hasLocalChanges && (
          <Button onClick={() => onRevertChanges()}>Revert changes</Button>
        )}

        {sessionStatus === 'authenticated' ? (
          isWriter ? (
            <NotebookSharingPopUp notebook={notebook} {...sharingProps} />
          ) : (
            <Button onClick={() => onDuplicateNotebook()}>
              Duplicate notebook
            </Button>
          )
        ) : (
          <Button
            href="https://rcagp49qi5w.typeform.com/to/i8uXYEtd"
            // Analytics
            onClick={() =>
              clientEvent({
                type: 'action',
                action: 'try decipad',
              })
            }
          >
            Try Decipad
          </Button>
        )}
      </div>
    </div>
  );
};
