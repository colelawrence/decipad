import { useWorkspaceMembers } from '@decipad/graphql-client';
import { NotebookTopbar } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { PermissionType } from 'libs/ui/src/types';
import { useSession } from 'next-auth/react';
import { ComponentProps, FC } from 'react';
import { Notebook } from './hooks/useNotebookStateAndActions';
import { MyEditor } from '@decipad/editor-types';
import { useEditorUndoState } from './hooks/useEditorUndoState';
import { useNotebookMetaActions } from '@decipad/react-contexts';
import { clearNotebook } from '../../utils';

type TopbarProps = Pick<
  ComponentProps<typeof NotebookTopbar>,
  | 'workspaces'
  | 'toggleSidebar'
  | 'hasUnpublishedChanges'
  | 'hasLocalChanges'
  | 'isPublishing'
  | 'status'
  | 'isReadOnly'
  | 'creationDate'
  | 'isNewNotebook'
> & {
  readonly notebook: Notebook;
  readonly removeLocalChanges?: () => void;
  readonly inviteEditorByEmail?: (
    email: string,
    permission: PermissionType
  ) => Promise<void>;
  readonly changeEditorAccess?: (
    userId: string,
    permission: PermissionType
  ) => Promise<void>;
  readonly removeEditorById?: (userId: string) => Promise<void>;
  readonly publishNotebook?: () => void;
  readonly unpublishNotebook?: () => void;
  readonly sidebarOpen: boolean;
  readonly editor: MyEditor | undefined;
};

const Topbar: FC<TopbarProps> = ({
  workspaces,
  notebook,
  hasLocalChanges,
  hasUnpublishedChanges,
  editor,
  isPublishing,
  isReadOnly,
  isNewNotebook,
  creationDate,
  removeLocalChanges,
  publishNotebook = noop,
  unpublishNotebook = noop,
  inviteEditorByEmail = () => Promise.resolve(),
  changeEditorAccess = () => Promise.resolve(),
  removeEditorById = () => Promise.resolve(),
  toggleSidebar,
  sidebarOpen,
  status,
}) => {
  const workspaceId = notebook?.workspace?.id || '';
  const { data: session } = useSession();
  const { everyone: usersFromTeam } = useWorkspaceMembers(workspaceId);
  const actions = useNotebookMetaActions();

  const [canUndo, canRedo] = useEditorUndoState(editor);

  if (!notebook) {
    return null;
  }

  return (
    <NotebookTopbar
      sidebarOpen={sidebarOpen}
      notebook={notebook}
      workspace={notebook.workspace}
      workspaces={workspaces}
      // TODO: ENG-1953 backend should provide this data
      workspaceAccess={
        workspaces?.some(
          (userWorkspace) => userWorkspace.id === notebook.workspace?.id
        )
          ? 'ADMIN'
          : undefined
      }
      isNewNotebook={isNewNotebook}
      usersWithAccess={notebook.access.users || []}
      usersFromTeam={usersFromTeam}
      permission={notebook.myPermissionType}
      isPublished={notebook.isPublic || undefined}
      isPublishing={isPublishing}
      // TODO: ENG-1953 backend should provide this data
      isSharedNotebook={notebook?.access?.users?.some(
        (permission) =>
          session?.user &&
          session.user.id === permission.user?.id &&
          permission.permission !== 'ADMIN'
      )}
      onRevertChanges={removeLocalChanges}
      hasLocalChanges={hasLocalChanges}
      hasUnpublishedChanges={hasUnpublishedChanges}
      onPublish={publishNotebook}
      onUnpublish={unpublishNotebook}
      onInvite={inviteEditorByEmail}
      onRemove={removeEditorById}
      onChange={changeEditorAccess}
      toggleSidebar={toggleSidebar}
      status={status}
      onChangeStatus={actions.onChangeStatus}
      isReadOnly={isReadOnly}
      isArchived={Boolean(notebook.archived)}
      canRedo={canRedo}
      canUndo={canUndo}
      onRedo={() => editor?.undoManager?.redo() || noop}
      onUndo={() => editor?.undoManager?.undo() || noop}
      notebookId={notebook.id}
      onMoveWorkspace={actions.onMoveToWorkspace}
      onDuplicate={actions.onDuplicateNotebook}
      onExport={actions.onDownloadNotebook}
      onExportBackups={actions.onDownloadNotebookHistory}
      onUnarchive={actions.onUnarchiveNotebook}
      onDelete={actions.onDeleteNotebook}
      creationDate={creationDate}
      onClearAll={() => editor && clearNotebook(editor)}
    />
  );
};

export default Topbar;
