import { DocSyncEditor } from '@decipad/docsync';
import { Editor, useCreateEditor } from '@decipad/editor';
import {
  ComputerContextProvider,
  EditorReadOnlyContext,
  ResultsContext,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { NotebookPage } from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { MyEditor } from '@decipad/editor-types';
import { createEditor } from 'slate';
import {
  NotebookStateProvider,
  useNotebookState,
} from '@decipad/notebook-state';
import { useHistory } from 'react-router-dom';
import { EMPTY } from 'rxjs';

export interface NotebookProps {
  notebookId: string;
  readOnly: boolean;
  icon: ReactNode;
  topbar: ReactNode;
  secret?: string;
  onEditor: (editor: MyEditor) => void;
  onDocsync: (docsync: DocSyncEditor) => void;
}

const InsideNotebookState = ({
  notebookId,
  readOnly,
  icon,
  secret,
  topbar,
  onEditor,
  onDocsync,
}: NotebookProps) => {
  // Computer
  const slateBaseEditor = useMemo(createEditor, [notebookId]);

  // User warning

  const toast = useToast();
  const { data: session } = useSession();

  // DocSync

  const {
    syncClientState,
    docSyncEditor,
    computer,
    init,
    loadedFromRemote,
    timedOutLoadingFromRemote,
    hasLocalChanges,
    destroy,
  } = useNotebookState();
  useEffect(() => {
    if (syncClientState === 'idle') {
      init(slateBaseEditor as MyEditor, notebookId, {
        authSecret: secret,
      });
    }
  }, [init, notebookId, secret, slateBaseEditor, syncClientState]);

  // Editor
  // Needs to be created last so other editor (e.g. docsync editor) wrapping editor functions
  // (e.g. apply, onChange) can be called with the latest values transformed via plugins. Things
  // get called from the outside in.
  const editor = useCreateEditor({
    editor: docSyncEditor,
    notebookId,
    computer,
    readOnly,
  });

  useEffect(() => {
    if (editor) {
      onEditor(editor);
    }
  }, [editor, onEditor]);

  // docSync

  useEffect(() => {
    if (docSyncEditor) {
      onDocsync(docSyncEditor);
    }
  }, [docSyncEditor, onDocsync]);

  const history = useHistory();
  useEffect(() => {
    return history.listen(destroy);
  }, [destroy, history]);

  // changes warning

  const warning: string | false =
    readOnly &&
    `Changes to this notebook are not saved${
      (session?.user &&
        '. Please duplicate to customize and make it your own.') ||
      ''
    }`;
  const [toastedWarning, setToastedWarning] = useState(false);

  useEffect(() => {
    if (warning && hasLocalChanges && !toastedWarning) {
      setToastedWarning(true);
      toast(warning as string, 'warning', { autoDismiss: false });
    }
  }, [editor, hasLocalChanges, toast, toastedWarning, warning]);

  // computer

  const computerObservable = useMemo(
    () => computer?.results.asObservable(),
    [computer?.results]
  );

  return (
    (editor && (
      <ComputerContextProvider computer={computer}>
        <EditorReadOnlyContext.Provider value={readOnly}>
          <ResultsContext.Provider value={computerObservable || EMPTY}>
            <NotebookPage
              notebook={
                <Editor
                  notebookId={notebookId}
                  loaded={loadedFromRemote || timedOutLoadingFromRemote}
                  editor={editor}
                  readOnly={readOnly}
                />
              }
              notebookIcon={icon}
              topbar={topbar}
            />
          </ResultsContext.Provider>
        </EditorReadOnlyContext.Provider>
      </ComputerContextProvider>
    )) ||
    null
  );
};

export const Notebook: FC<NotebookProps> = (props) => {
  return (
    <NotebookStateProvider>
      <InsideNotebookState {...props}></InsideNotebookState>
    </NotebookStateProvider>
  );
};
