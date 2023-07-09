import { useWorkspaceMembers } from '@decipad/graphql-client';
import { NotebookTopbar } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { PermissionType } from 'libs/ui/src/types';
import { useSession } from 'next-auth/react';
import { ComponentProps, FC } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Notebook } from './hooks/useNotebookStateAndActions';

type TopbarProps = Pick<
  ComponentProps<typeof NotebookTopbar>,
  'userWorkspaces' | 'toggleSidebar'
> & {
  readonly notebook: Notebook;
  readonly hasLocalChanges: BehaviorSubject<boolean> | undefined;
  readonly hasUnpublishedChanges: boolean;
  readonly isPublishing?: boolean;
  readonly duplicateNotebook?: () => void;
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
};

const Topbar: FC<TopbarProps> = ({
  userWorkspaces,
  notebook,
  hasLocalChanges,
  hasUnpublishedChanges,
  isPublishing,
  duplicateNotebook,
  removeLocalChanges,
  publishNotebook = noop,
  unpublishNotebook = noop,
  inviteEditorByEmail = () => Promise.resolve(),
  changeEditorAccess = () => Promise.resolve(),
  removeEditorById = () => Promise.resolve(),
  toggleSidebar,
  sidebarOpen,
}) => {
  const workspaceId = notebook?.workspace?.id || '';
  const { data: session } = useSession();
  const { everyone: usersFromTeam } = useWorkspaceMembers(workspaceId);

  if (!notebook) {
    return null;
  }

  return (
    <NotebookTopbar
      sidebarOpen={sidebarOpen}
      notebook={notebook}
      userWorkspaces={userWorkspaces}
      workspace={notebook.workspace}
      // TODO: ENG-1953 backend should provide this data
      workspaceAccess={
        userWorkspaces?.some(
          (userWorkspace) => userWorkspace.id === notebook.workspace?.id
        )
          ? 'ADMIN'
          : undefined
      }
      usersWithAccess={notebook.access.users || []}
      usersFromTeam={usersFromTeam}
      permission={notebook.myPermissionType}
      isPublished={notebook.isPublic || undefined}
      isPublishing={isPublishing}
      // TODO: ENG-1953 backend should provide this data
      isSharedNotebook={notebook?.access?.users?.some(
        (permission) =>
          session?.user?.id === permission.user.id &&
          permission.permission !== 'ADMIN'
      )}
      onRevertChanges={removeLocalChanges}
      hasLocalChanges={hasLocalChanges}
      hasUnpublishedChanges={hasUnpublishedChanges}
      onDuplicateNotebook={duplicateNotebook}
      onPublish={publishNotebook}
      onUnpublish={unpublishNotebook}
      onInvite={inviteEditorByEmail}
      onRemove={removeEditorById}
      onChange={changeEditorAccess}
      toggleSidebar={toggleSidebar}
    />
  );
};

export default Topbar;
