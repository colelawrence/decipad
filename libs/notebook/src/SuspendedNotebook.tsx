import { FC } from 'react';
import { BehaviorSubject } from 'rxjs';
import { Editor } from '@decipad/editor';
import { DocSyncEditor } from '@decipad/docsync';
import { InitialSelection } from './InitialSelection';

interface SuspendedNotebookProps {
  notebookId: string;
  workspaceId?: string;
  loaded: boolean;
  isSavedRemotely: BehaviorSubject<boolean>;
  editor: {
    read: () => DocSyncEditor;
  };
  readOnly: boolean;
  isNewNotebook: boolean;
}

export const SuspendedNotebook: FC<SuspendedNotebookProps> = ({
  notebookId,
  workspaceId,
  loaded,
  isSavedRemotely,
  editor,
  readOnly,
  isNewNotebook,
}) => {
  return (
    <Editor
      notebookId={notebookId}
      workspaceId={workspaceId}
      loaded={loaded}
      isSavedRemotely={isSavedRemotely}
      editor={editor.read()}
      readOnly={readOnly}
      isNewNotebook={isNewNotebook}
    >
      <InitialSelection
        loaded={loaded}
        editor={editor.read()}
        notebookId={notebookId}
      />
    </Editor>
  );
};
