import {
  NotebookMetaDataFragment,
  WorkspaceSwitcherWorkspaceFragment,
} from '@decipad/graphql-client';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import format from 'date-fns/format';
import { FC, ReactNode, useState, useContext } from 'react';
import { MenuItem, TriggerMenuItem } from '../../../shared/atoms';
import {
  Archive,
  Duplicate,
  Download,
  FolderOpen,
  GitBranch,
  Move,
  Trash,
} from '../../../icons';
import { MenuList } from '../../../shared/molecules';
import {
  cssVar,
  p12Medium,
  p12Regular,
  shortAnimationDuration,
} from '../../../primitives';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import { ClientEventsContext } from '@decipad/client-events';

export interface NotebookOptionsProps {
  readonly notebookId: string;
  readonly isArchived: boolean;
  readonly trigger: ReactNode;
  readonly workspaceId: string;
  readonly workspaceForDuplicate?: string;
  readonly canDelete?: boolean;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly actions: NotebookMetaActionsReturn;

  // Custom onDuplicate for redirecting purposes.
  readonly onDuplicate: (workspaceId: string) => void;
  readonly permissionType: NotebookMetaDataFragment['myPermissionType'];

  /* Optionals */
  readonly creationDate?: Date;
  // Show the 'draft', 'review', picker. Currently used
  // inside the notebook.
  readonly notebookStatus?: ReactNode;
}

export const NotebookOptions: FC<NotebookOptionsProps> = ({
  permissionType,
  trigger,
  isArchived,
  workspaces,
  notebookId: id,
  workspaceForDuplicate,
  workspaceId,
  creationDate,
  notebookStatus,
  canDelete = true,
  actions,
  onDuplicate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const clientEvent = useContext(ClientEventsContext);

  return (
    <div css={menuActionsStyles}>
      <MenuList
        root
        dropdown
        align="end"
        side="bottom"
        sideOffset={10}
        open={isOpen}
        onChangeOpen={setIsOpen}
        trigger={trigger}
      >
        {permissionType === 'READ' && (
          <ReaderInfo>
            As a Reader, you can not download or copy this notebook.
          </ReaderInfo>
        )}
        {workspaces.length !== 0 &&
          permissionType !== 'READ' &&
          (workspaces.length > 1 ? (
            <MenuList
              itemTrigger={
                <TriggerMenuItem icon={<Duplicate />}>
                  <MinDiv>Duplicate in</MinDiv>
                </TriggerMenuItem>
              }
            >
              {workspaces.map((workspace) => (
                <MenuItem
                  key={workspace.id}
                  onSelect={() => {
                    onDuplicate(workspace.id);
                    setIsOpen(false);
                  }}
                >
                  {workspace.name}
                </MenuItem>
              ))}
            </MenuList>
          ) : (
            <MenuItem
              icon={<Duplicate />}
              onSelect={() => {
                onDuplicate(workspaceForDuplicate ?? workspaceId);
                setIsOpen(false);
              }}
            >
              <MinDiv>Duplicate</MinDiv>
            </MenuItem>
          ))}
        {permissionType !== 'READ' && notebookStatus && <>{notebookStatus}</>}
        {permissionType === 'ADMIN' && workspaces.length > 1 && (
          <MenuList
            itemTrigger={
              <TriggerMenuItem icon={<Move />}>
                <MinDiv>Move to workspace</MinDiv>
              </TriggerMenuItem>
            }
          >
            {workspaces.map((workspace) => (
              <MenuItem
                key={workspace.id}
                icon={<Move />}
                onSelect={() => {
                  actions.onMoveToWorkspace(id, workspace.id, workspaceId);
                  setIsOpen(false);
                }}
              >
                {workspace.name}
              </MenuItem>
            ))}
          </MenuList>
        )}
        {permissionType !== 'READ' && (
          <>
            <MenuItem
              icon={<Download />}
              onSelect={() => {
                actions.onDownloadNotebook(id);
                setIsOpen(false);
              }}
            >
              Download
            </MenuItem>
            <MenuItem
              icon={<GitBranch />}
              onSelect={() => {
                actions.onDownloadNotebookHistory(id);
                setIsOpen(false);
                clientEvent({
                  segmentEvent: {
                    type: 'action',
                    action: 'Exported Notebook History',
                    props: {
                      analytics_source: 'frontend',
                    },
                  },
                });
              }}
            >
              Version History
            </MenuItem>
          </>
        )}
        {permissionType !== 'READ' && isArchived && (
          <MenuItem
            icon={<FolderOpen />}
            onSelect={() => {
              actions.onUnarchiveNotebook(id);
              setIsOpen(false);
            }}
          >
            Unarchive
          </MenuItem>
        )}

        {permissionType !== 'READ' && (canDelete || !isArchived) && (
          <MenuItem
            icon={isArchived ? <Trash /> : <Archive />}
            onSelect={() => {
              actions.onDeleteNotebook(id, true);
              setIsOpen(false);
            }}
          >
            {isArchived ? 'Delete' : 'Archive'}
          </MenuItem>
        )}

        {creationDate && (
          <li css={creationDateStyles}>
            <Dates>
              <span> Created: {format(creationDate, 'd MMM y')}</span>
            </Dates>
          </li>
        )}
      </MenuList>
    </div>
  );
};

const menuActionsStyles = css({
  gridArea: 'actions',

  display: 'grid',
  gridTemplateRows: '28px',

  transition: `opacity ${shortAnimationDuration} ease-out`,

  position: 'relative',
  opacity: 1,
});

const Dates = styled.span({
  display: 'flex',
  flexDirection: 'column',
});

const creationDateStyles = css(p12Medium, {
  paddingTop: '8px',
  lineHeight: '20px',
  backgroundColor: cssVar('backgroundDefault'),
  borderTop: `1px solid ${cssVar('borderSubdued')}`,
  color: cssVar('textSubdued'),
  margin: '-6px',
  padding: '4px 8px',
  listStyle: 'none',
  marginTop: '4px',
});

const MinDiv = styled.div({
  minWidth: '132px',
});

const ReaderInfo = styled.li(p12Regular, {
  padding: '4px 8px',
  width: '152px',
  listStyle: 'none',
});
