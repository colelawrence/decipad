import { NotebookTopbar } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { FC } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Notebook } from './hooks/useNotebookStateAndActions';

type TopbarProps = {
  readonly notebookId: string;
  readonly notebook: Notebook;
  readonly hasLocalChanges: BehaviorSubject<boolean> | undefined;
  readonly duplicateNotebook?: () => void;
  readonly removeLocalChanges?: () => void;
  readonly isNotebookPublic?: boolean;
  readonly setNotebookPublic?: (isPublic: boolean) => void;
};

const Topbar: FC<TopbarProps> = ({
  notebookId,
  notebook,
  hasLocalChanges,
  duplicateNotebook,
  removeLocalChanges,
  isNotebookPublic,
  setNotebookPublic = noop,
}) => {
  const handleToggleMakePublic = () => {
    setNotebookPublic(!isNotebookPublic);
  };

  if (!notebook) {
    return null;
  }

  return (
    <NotebookTopbar
      notebook={{
        id: notebookId,
        name: notebook.name,
      }}
      workspace={notebook.workspace}
      usersWithAccess={notebook.access.users}
      permission={notebook.myPermissionType}
      onToggleMakePublic={handleToggleMakePublic}
      isPublic={notebook.isPublic || undefined}
      onRevertChanges={removeLocalChanges}
      hasLocalChanges={hasLocalChanges}
      onDuplicateNotebook={duplicateNotebook}
    />
  );
};

export default Topbar;
