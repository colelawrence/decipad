import { NotebookTopbar } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { ComponentProps, FC } from 'react';
import { BehaviorSubject } from 'rxjs';
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
  readonly inviteEditorByEmail?: (email: string) => Promise<void>;
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
  removeEditorById = () => Promise.resolve(),
}) => {
  if (!notebook) {
    return null;
  }

  return (
    <NotebookTopbar
      notebook={notebook}
      userWorkspaces={userWorkspaces}
      workspace={notebook.workspace}
      usersWithAccess={notebook.access.users}
      permission={notebook.myPermissionType}
      isPublished={notebook.isPublic || undefined}
      isPublishing={isPublishing}
      onRevertChanges={removeLocalChanges}
      hasLocalChanges={hasLocalChanges}
      hasUnpublishedChanges={hasUnpublishedChanges}
      onDuplicateNotebook={duplicateNotebook}
      onPublish={publishNotebook}
      onUnpublish={unpublishNotebook}
      onInvite={inviteEditorByEmail}
      onRemove={removeEditorById}
    />
  );
};

export default Topbar;
