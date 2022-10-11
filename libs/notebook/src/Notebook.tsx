import { DocSyncEditor } from '@decipad/docsync';
import { Editor, useCreateEditor } from '@decipad/editor';
import { BubbleEditor } from '@decipad/editor-components';
import { MyEditor } from '@decipad/editor-types';
import {
  NotebookStateProvider,
  useNotebookState,
} from '@decipad/notebook-state';
import {
  ComputerContextProvider,
  StarterChecklistContextProvider,
  StarterChecklistInitialState,
  StarterChecklistStateChange,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { useSession } from 'next-auth/react';
import { FC, ReactNode, useEffect, useState } from 'react';
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
  initialState?: string;
  onEditor: (editor: MyEditor) => void;
  onDocsync: (docsync: DocSyncEditor) => void;
}

type NotebookStarterChecklistProps = {
  checklistState: StarterChecklistInitialState;
  onChecklistStateChange: (props: StarterChecklistStateChange) => void;
};

const InsideNotebookState = ({
  notebookId,
  notebookTitle,
  onNotebookTitleChange,
  readOnly,
  secret,
  connectionParams,
  initialState,
  onEditor,
  onDocsync,
}: NotebookProps) => {
  // User warning
  const toast = useToast();
  const { data: session } = useSession();

  const {
    docSyncEditor,
    computer,
    initComputer,
    initDocSync,
    loadedFromRemote,
    timedOutLoadingFromRemote,
    hasLocalChanges,
    destroy,
  } = useNotebookState();

  const interactions = useEditorUserInteractionsContext();

  const editor = useCreateEditor({
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

  useEffect(() => {
    if (!computer) {
      initComputer();
    } else if (!docSyncEditor && editor) {
      initDocSync(notebookId, {
        editor,
        authSecret: secret,
        connectionParams,
        initialState,
      });
    }
  }, [
    initComputer,
    initDocSync,
    destroy,
    notebookId,
    secret,
    connectionParams,
    computer,
    docSyncEditor,
    editor,
    initialState,
  ]);

  useEffect(() => {
    if (docSyncEditor && docSyncEditor.id !== notebookId) {
      destroy();
    }
  }, [destroy, docSyncEditor, notebookId]);

  useEffect(() => {
    return destroy; // always destroy the editor on unmount
  }, [destroy]);

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

export const Notebook: FC<NotebookStarterChecklistProps & NotebookProps> = (
  props
) => {
  const { checklistState, onChecklistStateChange, ...rest } = props;
  return (
    <NotebookStateProvider>
      <EditorUserInteractionsProvider>
        <NotebookWithChecklist
          checklistState={checklistState}
          onChecklistStateChange={onChecklistStateChange}
        >
          <InsideNotebookState {...rest} />
        </NotebookWithChecklist>
      </EditorUserInteractionsProvider>
    </NotebookStateProvider>
  );
};

const NotebookWithChecklist: FC<
  NotebookStarterChecklistProps & { children: ReactNode }
> = ({ checklistState, onChecklistStateChange, children }) => {
  const { loadedFromLocal, loadedFromRemote, timedOutLoadingFromRemote } =
    useNotebookState();

  return (
    <StarterChecklistContextProvider
      loaded={
        loadedFromLocal && (loadedFromRemote || timedOutLoadingFromRemote)
      }
      initialState={checklistState}
      onStateChange={onChecklistStateChange}
    >
      {children}
    </StarterChecklistContextProvider>
  );
};
