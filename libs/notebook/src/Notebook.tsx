import { DocSyncEditor } from '@decipad/docsync';
import { Editor, useCreateEditor } from '@decipad/editor';
import { MyEditor } from '@decipad/editor-types';
import {
  NotebookStateProvider,
  useNotebookState,
} from '@decipad/notebook-state';
import { ComputerContextProvider } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { BubbleEditor } from '../../editor-components/src/BubbleEditor/BubbleEditor';

export interface NotebookProps {
  notebookId: string;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
  readOnly: boolean;
  secret?: string;
  onEditor: (editor: MyEditor) => void;
  onDocsync: (docsync: DocSyncEditor) => void;
}

const InsideNotebookState = ({
  notebookId,
  notebookTitle,
  onNotebookTitleChange,
  readOnly,
  secret,
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
    docSyncEditor,
    computer,
    init,
    loadedFromRemote,
    timedOutLoadingFromRemote,
    hasLocalChanges,
    destroy,
  } = useNotebookState();
  useEffect(() => {
    init(slateBaseEditor as MyEditor, notebookId, {
      authSecret: secret,
    });
    return destroy;
  }, [init, destroy, notebookId, secret, slateBaseEditor]);

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

  if (editor) {
    return (
      <ComputerContextProvider computer={computer}>
        <BubbleEditor>
          <Editor
            notebookId={notebookId}
            loaded={loadedFromRemote || timedOutLoadingFromRemote}
            editor={editor}
            readOnly={readOnly}
          />
        </BubbleEditor>
      </ComputerContextProvider>
    );
  }
  return null;
};

export const Notebook: FC<NotebookProps> = (props) => {
  return (
    <NotebookStateProvider>
      <InsideNotebookState {...props}></InsideNotebookState>
    </NotebookStateProvider>
  );
};
