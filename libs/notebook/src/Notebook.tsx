import { DocSyncEditor } from '@decipad/docsync';
import { Editor, useCreateEditor } from '@decipad/editor';
import { BubbleEditor } from '@decipad/editor-components';
import { MyEditor } from '@decipad/editor-types';
import {
  NotebookStateProvider,
  useNotebookState,
} from '@decipad/notebook-state';
import { ComputerContextProvider } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useState } from 'react';
import {
  EditorUserInteractionsProvider,
  useEditorUserInteractionsContext,
} from '../../react-contexts/src/editor-user-interactions';
import { InitialSelection } from './InitialSelection';

export interface NotebookConnectionParams {
  url: string;
  token: string;
}

export interface NotebookProps {
  notebookId: string;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
  readOnly: boolean;
  secret?: string;
  connectionParams: NotebookConnectionParams | undefined;
  onEditor: (editor: MyEditor) => void;
  onDocsync: (docsync: DocSyncEditor) => void;
}

const InsideNotebookState = ({
  notebookId,
  notebookTitle,
  onNotebookTitleChange,
  readOnly,
  secret,
  connectionParams,
  onEditor,
  onDocsync,
}: NotebookProps) => {
  // User warning
  const toast = useToast();
  const { data: session } = useSession();

  // DocSync

  const {
    docSyncEditor,
    computer,
    init,
    loadedFromRemote,
    timedOutLoadingFromRemote,
    hasLocalChanges,
    destroy,
  } = useNotebookState();

  useEffect(() => {
    init(notebookId, {
      authSecret: secret,
      connectionParams,
    });
  }, [init, destroy, notebookId, secret, connectionParams]);

  useEffect(() => {
    return destroy; // always destroy the editor on unmount
  }, [destroy]);

  const interactions = useEditorUserInteractionsContext();

  // Editor
  // Needs to be created last so other editor (e.g. docsync editor) wrapping editor functions
  // (e.g. apply, onChange) can be called with the latest values transformed via plugins. Things
  // get called from the outside in.
  const editor = useCreateEditor({
    editor: docSyncEditor,
    notebookId,
    computer,
    readOnly,
    notebookTitle,
    onNotebookTitleChange,
    interactions,
  });
  const loaded = loadedFromRemote || timedOutLoadingFromRemote;

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

  if (editor) {
    return (
      <ComputerContextProvider computer={computer}>
        <BubbleEditor>
          <Editor
            notebookId={notebookId}
            loaded={loaded}
            editor={editor}
            readOnly={readOnly}
          >
            <InitialSelection loaded={loaded} editor={editor} />
          </Editor>
        </BubbleEditor>
      </ComputerContextProvider>
    );
  }
  return null;
};

export const Notebook: FC<NotebookProps> = (props) => {
  return (
    <NotebookStateProvider>
      <EditorUserInteractionsProvider>
        <InsideNotebookState {...props}></InsideNotebookState>
      </EditorUserInteractionsProvider>
    </NotebookStateProvider>
  );
};
