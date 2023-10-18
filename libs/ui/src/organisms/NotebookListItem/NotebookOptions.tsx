import {
  NotebookMetaDataFragment,
  PermissionType,
  WorkspaceSwitcherWorkspaceFragment,
} from '@decipad/graphql-client';
import { NotebookMetaActionsType } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import format from 'date-fns/format';
import { FC, ReactNode, useState } from 'react';
import { MenuItem, TriggerMenuItem } from '../../atoms';
import {
  AddToWorkspace,
  Archive,
  Copy,
  Download,
  FolderOpen,
  GitBranch,
  Switch,
  Trash,
} from '../../icons';
import { MenuList } from '../../molecules';
import {
  cssVar,
  p12Medium,
  p12Regular,
  shortAnimationDuration,
} from '../../primitives';

export interface NotebookOptionsProps {
  readonly notebookId: string;
  readonly isArchived: boolean;
  readonly trigger: ReactNode;
  readonly workspaceId: string;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly onDuplicate: NotebookMetaActionsType['onDuplicateNotebook'];
  readonly onExport: NotebookMetaActionsType['onDownloadNotebook'];
  readonly onExportBackups: NotebookMetaActionsType['onDownloadNotebookHistory'];
  readonly onUnarchive: NotebookMetaActionsType['onUnarchiveNotebook'];
  readonly onDelete: NotebookMetaActionsType['onDeleteNotebook'];
  readonly onMoveWorkspace: NotebookMetaActionsType['onMoveToWorkspace'];
  readonly permissionType: NotebookMetaDataFragment['myPermissionType'];

  /* Optionals */
  readonly creationDate?: Date;
  // Show the 'draft', 'review', picker. Currently used
  // inside the notebook.
  readonly notebookStatus?: ReactNode;
}

export const NotebookOptions: FC<NotebookOptionsProps> = ({
  onDuplicate,
  onExport,
  onExportBackups,
  onUnarchive,
  onDelete,
  onMoveWorkspace,
  permissionType,
  trigger,
  isArchived,
  workspaces,
  notebookId: id,

  creationDate,
  notebookStatus,
  workspaceId,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
        {permissionType === PermissionType.Read && (
          <ReaderInfo>
            As a Reader, you can not download or copy this notebook.
          </ReaderInfo>
        )}
        {permissionType !== PermissionType.Read &&
          (workspaces.length > 1 ? (
            <MenuList
              itemTrigger={
                <TriggerMenuItem icon={<Copy />}>
                  <MinDiv>Duplicate in</MinDiv>
                </TriggerMenuItem>
              }
            >
              {workspaces.map((workspace) => (
                <MenuItem
                  key={workspace.id}
                  onSelect={() => {
                    onDuplicate(id, false, workspace.id);
                    setIsOpen(false);
                  }}
                >
                  {workspace.name}
                </MenuItem>
              ))}
            </MenuList>
          ) : (
            <MenuItem
              icon={<Copy />}
              onSelect={() => {
                onDuplicate(id, false, workspaceId);
                setIsOpen(false);
              }}
            >
              <MinDiv>Duplicate</MinDiv>
            </MenuItem>
          ))}
        {notebookStatus && notebookStatus}
        {permissionType === PermissionType.Admin && workspaces.length > 1 && (
          <MenuList
            itemTrigger={
              <TriggerMenuItem icon={<Switch />}>
                <MinDiv>Move to workspace</MinDiv>
              </TriggerMenuItem>
            }
          >
            {workspaces.map((workspace) => (
              <MenuItem
                key={workspace.id}
                icon={<AddToWorkspace />}
                onSelect={() => {
                  onMoveWorkspace(id, workspace.id);
                  setIsOpen(false);
                }}
              >
                {workspace.name}
              </MenuItem>
            ))}
          </MenuList>
        )}
        {permissionType !== PermissionType.Read && (
          <>
            <MenuItem
              icon={<Download />}
              onSelect={() => {
                onExport(id);
                setIsOpen(false);
              }}
            >
              Download
            </MenuItem>
            <MenuItem
              icon={<GitBranch />}
              onSelect={() => {
                onExportBackups(id);
                setIsOpen(false);
              }}
            >
              Version History
            </MenuItem>
          </>
        )}
        {permissionType !== PermissionType.Read && isArchived && (
          <MenuItem
            icon={<FolderOpen />}
            onSelect={() => {
              onUnarchive(id);
              setIsOpen(false);
            }}
          >
            Put back
          </MenuItem>
        )}

        {permissionType !== PermissionType.Read && (
          <MenuItem
            icon={isArchived ? <Trash /> : <Archive />}
            onSelect={() => {
              onDelete(id, true);
              setIsOpen(false);
            }}
          >
            {isArchived ? 'Delete' : 'Archive'}
          </MenuItem>
        )}

        {creationDate && (
          <li css={creationDateStyles}>
            <Dates>
              <span> Created: {format(creationDate, 'd MMM Y')}</span>
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
  border: `1px solid ${cssVar('borderSubdued')}`,
  color: cssVar('textSubdued'),
  margin: '-7px',
  borderRadius: '0 0 8px 8px',
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
