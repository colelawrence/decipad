import { NotebookTopbar } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { FC } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Notebook } from './hooks/useNotebookStateAndActions';

type TopbarProps = {
  readonly notebook: Notebook;
  readonly hasLocalChanges: BehaviorSubject<boolean> | undefined;
  readonly hasUnpublishedChanges: boolean;
  readonly duplicateNotebook?: () => void;
  readonly removeLocalChanges?: () => void;
  readonly publishNotebook?: () => void;
  readonly unpublishNotebook?: () => void;
};

const Topbar: FC<TopbarProps> = ({
  notebook,
  hasLocalChanges,
  hasUnpublishedChanges,
  duplicateNotebook,
  removeLocalChanges,
  publishNotebook = noop,
  unpublishNotebook = noop,
}) => {
  if (!notebook) {
    return null;
  }

  return (
    <NotebookTopbar
      notebook={notebook}
      workspace={notebook.workspace}
      usersWithAccess={notebook.access.users}
      permission={notebook.myPermissionType}
      isPublished={notebook.isPublic || undefined}
      onRevertChanges={removeLocalChanges}
      hasLocalChanges={hasLocalChanges}
      hasUnpublishedChanges={hasUnpublishedChanges}
      onDuplicateNotebook={duplicateNotebook}
      onPublish={publishNotebook}
      onUnpublish={unpublishNotebook}
    />
  );
};

export default Topbar;
