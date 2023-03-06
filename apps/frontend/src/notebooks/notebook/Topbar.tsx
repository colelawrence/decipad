import { NotebookTopbar } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { ComponentProps, FC } from 'react';
import { BehaviorSubject } from 'rxjs';
import { PermissionType } from 'libs/ui/src/types';
import { useSession } from 'next-auth/react';
import { Notebook } from './hooks/useNotebookStateAndActions';

type TopbarProps = Pick<
  ComponentProps<typeof NotebookTopbar>,
  'userWorkspaces'
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
}) => {
  const { data: session } = useSession();

  if (!notebook) {
    return null;
  }

  return (
    <NotebookTopbar
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
      usersWithAccess={notebook.access.users}
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
    />
  );
};

export default Topbar;
