import { FC } from 'react';
import { Editor } from '@decipad/editor';
import { DocSyncEditor } from '@decipad/docsync';
import { InitialSelection } from './InitialSelection';

interface SuspendedNotebookProps {
  notebookId: string;
  workspaceId?: string;
  loaded: boolean;
  editor: {
    read: () => DocSyncEditor;
  };
  readOnly: boolean;
}

export const SuspendedNotebook: FC<SuspendedNotebookProps> = ({
  notebookId,
  workspaceId,
  loaded,
  editor,
  readOnly,
}) => {
  return (
    <Editor
      notebookId={notebookId}
      workspaceId={workspaceId}
      loaded={loaded}
      editor={editor.read()}
      readOnly={readOnly}
    >
      <InitialSelection
        loaded={loaded}
        editor={editor.read()}
        notebookId={notebookId}
      />
    </Editor>
  );
};
