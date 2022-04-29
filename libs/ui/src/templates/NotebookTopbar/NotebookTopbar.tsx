import { docs, workspaces } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useSession } from 'next-auth/client';
import { ComponentProps, FC, useContext } from 'react';
import { ClientEventsContext } from '../../../../client-events/src';
import { Button, IconButton } from '../../atoms';
import { LeftArrow } from '../../icons';
import { NotebookAvatars, NotebookPath } from '../../molecules';
import { NotebookSharingPopUp } from '../../organisms';
import { cssVar, p14Medium } from '../../primitives';
import { PermissionType } from '../../types';
import { Anchor } from '../../utils';

const wrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  rowGap: '8px',

  padding: '16px 0',

  borderBottom: '1px solid',
  borderColor: cssVar('highlightColor'),
});

const leftSideStyles = css({
  flexGrow: 999,

  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const rightSideStyles = css({
  flexGrow: 1,

  display: 'grid',
  gridTemplateColumns: '1fr max-content max-content',
  alignItems: 'center',
  gap: '1rem',
});

const linksStyles = css({
  display: 'flex',
  gap: '12px',
});
const helpLinkStyles = css(p14Medium);

export type NotebookTopbarProps = Pick<
  ComponentProps<typeof NotebookPath>,
  'workspace'
> &
  Pick<ComponentProps<typeof NotebookAvatars>, 'usersWithAccess'> &
  ComponentProps<typeof NotebookSharingPopUp> & {
    permission: PermissionType;

    onDuplicateNotebook?: () => void;
  };

export const NotebookTopbar = ({
  workspace,
  notebook,
  onDuplicateNotebook = noop,
  usersWithAccess,
  permission,
  ...sharingProps
}: NotebookTopbarProps): ReturnType<FC> => {
  const [session] = useSession();
  const isAdmin = permission === 'ADMIN';
  const clientEvent = useContext(ClientEventsContext);

  return (
    <div css={wrapperStyles}>
      {/* Left side */}
      <div css={leftSideStyles}>
        {isAdmin && (
          <div css={{ width: '32px', display: 'grid' }}>
            <IconButton
              href={workspaces({}).workspace({ workspaceId: workspace.id }).$}
            >
              <LeftArrow />
            </IconButton>
          </div>
        )}
        <NotebookPath
          isAdmin={isAdmin}
          workspace={workspace}
          notebookName={notebook.name}
        />
      </div>

      {/* Right side */}
      <div css={rightSideStyles}>
        {isAdmin && (
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
                Get Inspiration
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
                Need help?
              </Anchor>
            </em>
          </div>
        )}
        <NotebookAvatars usersWithAccess={usersWithAccess} />

        {session?.user ? (
          isAdmin ? (
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
