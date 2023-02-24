import { DocSyncEditor } from '@decipad/docsync';
import { Editor, useEditorPlugins } from '@decipad/editor';
import { MyEditor } from '@decipad/editor-types';
import { useNotebookState } from '@decipad/notebook-state';
import {
  ComputerContextProvider,
  StarterChecklistContextProvider,
  StarterChecklistInitialState,
  StarterChecklistStateChange,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { insertLiveConnection } from '@decipad/editor-components';
import { EditorAttachmentsHandler } from '@decipad/editor-attachments';
import { useSession } from 'next-auth/react';
import { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  notebookMetaLoaded: boolean;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
  readOnly: boolean;
  secret?: string;
  connectionParams: NotebookConnectionParams | undefined;
  initialState?: string;
  onEditor: (editor: MyEditor) => void;
  onDocsync: (docsync: DocSyncEditor) => void;
  getAttachmentForm: (
    file: File
  ) => Promise<undefined | [URL, FormData, string]>;
  onAttached: (handle: string) => Promise<undefined | { url: URL }>;
}

type NotebookStarterChecklistProps = {
  checklistState: StarterChecklistInitialState;
  onChecklistStateChange: (props: StarterChecklistStateChange) => void;
};

type InsideNodebookStateProps = Omit<
  NotebookProps,
  'getAttachmentForm' | 'onAttached'
>;

const InsideNotebookState = ({
  notebookId,
  notebookMetaLoaded,
  notebookTitle,
  onNotebookTitleChange,
  readOnly,
  secret,
  connectionParams,
  initialState,
  onEditor,
  onDocsync,
}: InsideNodebookStateProps) => {
  // User warning
  const toast = useToast();
  const { data: session } = useSession();

  const {
    initComputer,
    initEditor,
    editor,
    computer,
    loadedFromRemote,
    timedOutLoadingFromRemote,
    hasLocalChanges,
    destroy,
  } = useNotebookState();

  const interactions = useEditorUserInteractionsContext();

  const plugins = useEditorPlugins({
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
    } else if (notebookMetaLoaded && plugins) {
      initEditor(
        notebookId,
        {
          plugins,
          docsync: {
            readOnly,
            authSecret: secret,
            connectionParams,
            initialState,
            protocolVersion: 2,
          },
        },
        () => session ?? undefined
      );
    }
  }, [
    computer,
    connectionParams,
    editor,
    initComputer,
    initEditor,
    initialState,
    notebookId,
    notebookMetaLoaded,
    plugins,
    readOnly,
    secret,
    session,
  ]);

  const location = useLocation();

  useEffect(() => {
    return destroy; // always destroy the editor on unmount
  }, [destroy, location]);

  // docSync

  useEffect(() => {
    if (editor) {
      onDocsync(editor);
    }
  }, [editor, onDocsync]);

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

  // import external doc
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  useEffect(() => {
    const importThing = qs.get('import');
    if (loaded && computer && editor && importThing) {
      (async () => {
        try {
          await insertLiveConnection({
            computer,
            editor,
            source: 'gsheets',
            url: importThing,
          });
        } catch (err) {
          toast((err as Error).message, 'error');
        }
      })();
    }
  }, [computer, editor, loaded, qs, toast]);

  if (editor) {
    return (
      <ComputerContextProvider computer={computer}>
        <Editor
          notebookId={notebookId}
          loaded={loaded}
          isSavedRemotely={editor.isSavedRemotely()}
          editor={editor}
          readOnly={readOnly}
        >
          <InitialSelection loaded={loaded} editor={editor} />
        </Editor>
      </ComputerContextProvider>
    );
  }
  return null;
};

export const Notebook: FC<NotebookStarterChecklistProps & NotebookProps> = (
  props
) => {
  const {
    checklistState,
    onChecklistStateChange,
    getAttachmentForm,
    onAttached,
    ...rest
  } = props;
  return (
    <EditorUserInteractionsProvider>
      <NotebookWithChecklist
        checklistState={checklistState}
        onChecklistStateChange={onChecklistStateChange}
      >
        <EditorAttachmentsHandler
          getAttachmentForm={getAttachmentForm}
          onAttached={onAttached}
        />
        <InsideNotebookState {...rest} />
      </NotebookWithChecklist>
    </EditorUserInteractionsProvider>
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
