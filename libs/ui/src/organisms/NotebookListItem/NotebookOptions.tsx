import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FC, ReactNode, useState } from 'react';
import format from 'date-fns/format';
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
import { MenuItem, TriggerMenuItem } from '../../atoms';
import { cssVar, p12Medium, shortAnimationDuration } from '../../primitives';
import { MenuList } from '../../molecules';
import { NotebookMetaActionsType } from '@decipad/react-contexts';
import { WorkspaceSwitcherWorkspaceFragment } from '@decipad/graphql-client';

export interface NotebookOptionsProps {
  readonly notebookId: string;
  readonly isArchived: boolean;
  readonly trigger: ReactNode;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly onDuplicate: NotebookMetaActionsType['onDuplicateNotebook'];
  readonly onExport: NotebookMetaActionsType['onDownloadNotebook'];
  readonly onExportBackups: NotebookMetaActionsType['onDownloadNotebookHistory'];
  readonly onUnarchive: NotebookMetaActionsType['onUnarchiveNotebook'];
  readonly onDelete: NotebookMetaActionsType['onDeleteNotebook'];
  readonly onMoveWorkspace: NotebookMetaActionsType['onMoveToWorkspace'];

  /* Optionals */
  readonly creationDate?: Date;
  // Show the 'draft', 'review', picker. Currently used
  // inside the notebook.
  readonly notebookStatus?: ReactNode;
  // Allow the duplicate option.
  readonly allowDuplicate?: boolean;
}

export const NotebookOptions: FC<NotebookOptionsProps> = ({
  onDuplicate,
  onExport,
  onExportBackups,
  onUnarchive,
  onDelete,
  onMoveWorkspace,
  trigger,
  isArchived,
  workspaces,
  notebookId: id,

  creationDate,
  notebookStatus,
  allowDuplicate = false,
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
        {allowDuplicate && (
          <MenuItem
            icon={<Copy />}
            onSelect={() => {
              onDuplicate(id);
              setIsOpen(false);
            }}
          >
            <MinDiv>Duplicate</MinDiv>
          </MenuItem>
        )}
        {notebookStatus && notebookStatus}
        {workspaces.length > 1 && (
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
        {isArchived && (
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
        <MenuItem
          icon={isArchived ? <Trash /> : <Archive />}
          onSelect={() => {
            onDelete(id, true);
            setIsOpen(false);
          }}
        >
          {isArchived ? 'Delete' : 'Archive'}
        </MenuItem>

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
