import { ClientEventsContext } from '@decipad/client-events';
import {
  NotebookMetaDataFragment,
  WorkspaceSwitcherWorkspaceFragment,
} from '@decipad/graphql-client';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import { useToast } from '@decipad/toast';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import format from 'date-fns/format';
import { Section } from 'libs/ui/src/types';
import { FC, ReactNode, useContext, useState } from 'react';
import {
  Archive,
  Download,
  Duplicate,
  FolderOpen,
  GitBranch,
  Move,
  Trash,
} from '../../../icons';
import {
  cssVar,
  p12Medium,
  p12Regular,
  shortAnimationDuration,
} from '../../../primitives';
import { MenuItem, TriggerMenuItem } from '../../../shared/atoms';
import { BetaBadge, MenuList } from '../../../shared/molecules';

export interface NotebookOptionsProps {
  readonly notebookId: string;
  readonly isArchived: boolean;
  readonly trigger: ReactNode;
  readonly workspaceId: string;
  readonly workspaceForDuplicate?: string;
  readonly canDelete?: boolean;
  readonly workspaces: Array<WorkspaceSwitcherWorkspaceFragment>;
  readonly actions: NotebookMetaActionsReturn;
  readonly sections?: Section[];
  readonly popupSide?: 'bottom' | 'left' | 'right' | 'top';
  readonly popupAlign?: 'center' | 'end' | 'start';

  // Custom onDuplicate for redirecting purposes.
  readonly onDuplicate: (workspaceId: string) => void;
  readonly permissionType: NotebookMetaDataFragment['myPermissionType'];

  /* Optionals */
  readonly creationDate?: Date;
  // Show the 'draft', 'review', picker. Currently used
  // inside the notebook.
  readonly notebookStatus?: ReactNode;

  readonly keepModalOpen?: (_: boolean) => void;
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
  sections,
  onDuplicate,
  popupSide = 'bottom',
  popupAlign = 'end',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const clientEvent = useContext(ClientEventsContext);
  const toast = useToast();

  const downloadPDF = (_: string) => {
    window.print();
    toast('Use `Save as pdf` from your printing window', 'info');
  };

  return (
    <div css={menuActionsStyles}>
      <MenuList
        root
        dropdown
        align={popupAlign}
        side={popupSide}
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
        {permissionType !== 'READ' && sections && (
          <MenuList
            itemTrigger={
              <TriggerMenuItem icon={<Move />}>
                <MinDiv>Move to folder</MinDiv>
              </TriggerMenuItem>
            }
          >
            {sections.map((section) => (
              <MenuItem
                key={section.id}
                icon={<Move />}
                onSelect={() => {
                  actions.onMoveToSection(id, section.id);
                  setIsOpen(false);
                }}
              >
                {section.name}
              </MenuItem>
            ))}
          </MenuList>
        )}
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
            <MenuList
              itemTrigger={
                <TriggerMenuItem icon={<Download />}>
                  <MinDiv>Export</MinDiv>
                </TriggerMenuItem>
              }
            >
              <MenuItem
                onSelect={() => {
                  try {
                    downloadPDF(`${workspaceId}-${id}`);
                    clientEvent({
                      segmentEvent: {
                        type: 'action',
                        action: 'Notebook Downloaded',
                        props: {
                          analytics_source: 'frontend',
                          format: 'pdf',
                        },
                      },
                    });
                  } catch (error) {
                    toast((error as Error).message, 'warning');
                  }
                }}
              >
                <span>PDF</span>
                <div css={betaWrapper}>
                  <BetaBadge />
                </div>
              </MenuItem>
              <MenuItem
                onSelect={() => {
                  actions.onDownloadNotebook(id);
                  setIsOpen(false);
                  clientEvent({
                    segmentEvent: {
                      type: 'action',
                      action: 'Notebook Downloaded',
                      props: {
                        analytics_source: 'frontend',
                        format: 'json',
                      },
                    },
                  });
                }}
              >
                JSON
              </MenuItem>
            </MenuList>

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

const betaWrapper = css({ display: 'inline-block', marginLeft: 20 });
