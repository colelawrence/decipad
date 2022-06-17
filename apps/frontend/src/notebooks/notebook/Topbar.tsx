import type { DocSyncEditor } from '@decipad/docsync';
import type { MyEditor } from '@decipad/editor-types';
import { NotebookTopbar } from '@decipad/ui';
import { FC } from 'react';
import {
  useGetNotebookTopbarQuery,
  useGetWorkspacesIDsQuery,
  useSetNotebookPublicMutation,
} from '../../graphql';
import { ErrorPage } from '../../meta';
import { useDuplicateNotebook } from './hooks/useDuplicateNotebook';

type TopbarProps = {
  readonly notebookId: string;
  readonly docsync?: DocSyncEditor;
  readonly editor?: MyEditor;
};

const Topbar: FC<TopbarProps> = ({ notebookId, docsync, editor }) => {
  const [result] = useGetNotebookTopbarQuery({
    variables: {
      id: notebookId,
    },
  });
  const [workspacesResult] = useGetWorkspacesIDsQuery();
  const [, setNotebookPublic] = useSetNotebookPublicMutation();
  const { data, error } = result;
  const { data: workspacesData, error: workspacesError } = workspacesResult;
  const [duplicateNotebook] = useDuplicateNotebook({ id: notebookId, editor });
  const handleToggleMakePublic = () => {
    setNotebookPublic({
      id: notebookId,
      isPublic: !notebook.isPublic,
    });
  };

  const handleRevertChanges = async () => {
    await docsync?.removeLocalChanges();
    window.location.reload();
  };

  if (error) {
    if (/no such/i.test(error?.message))
      return <ErrorPage Heading="h1" wellKnown="404" />;
    throw error;
  }
  if (!data || !data.getPadById) {
    throw new Error('Missing notebook');
  }

  if (workspacesError) {
    throw workspacesError;
  }
  if (!workspacesData) {
    throw new Error('Missing workspaces');
  }

  const notebook = data.getPadById;

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
      onRevertChanges={handleRevertChanges}
      hasLocalChanges={docsync?.hasLocalChanges()}
      onDuplicateNotebook={duplicateNotebook}
    />
  );
};

export default Topbar;
