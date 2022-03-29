import { docs } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { ClientEventsContext } from '@decipad/client-events';
import { css } from '@emotion/react';
import { useSession } from 'next-auth/client';
import { ComponentProps, FC, useContext } from 'react';
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
  'workspaceName' | 'notebookName'
> &
  Pick<ComponentProps<typeof NotebookAvatars>, 'usersWithAccess'> & {
    workspaceHref: string;
    permission: PermissionType;
    link: string;
    onToggleShare?: () => void;
    onDuplicateNotebook?: () => void;
    sharingActive?: boolean;
  };

export const NotebookTopbar = ({
  workspaceName,
  notebookName,
  onToggleShare = noop,
  onDuplicateNotebook = noop,
  usersWithAccess,
  permission,
  sharingActive = false,
  link,
  workspaceHref,
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
            <IconButton href={workspaceHref}>
              <LeftArrow />
            </IconButton>
          </div>
        )}
        <NotebookPath
          isAdmin={isAdmin}
          workspaceName={workspaceName}
          notebookName={notebookName}
          workspaceHref={workspaceHref}
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
            <NotebookSharingPopUp
              sharingActive={sharingActive}
              onToggleShare={onToggleShare}
              link={link}
            />
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
