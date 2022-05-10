import { DocSyncEditor, OnLoadedCallback } from '@decipad/docsync';
import { Editor, useCreateEditor } from '@decipad/editor';
import { useDocSync } from '@decipad/editor-plugins';
import { Computer } from '@decipad/language';
import {
  ComputerContextProvider,
  EditorReadOnlyContext,
  ResultsContext,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { NotebookPage } from '@decipad/ui';
import { captureException } from '@sentry/browser';
import { PlateEditor } from '@udecode/plate';
import { useSession } from 'next-auth/client';
import { ReactNode, useCallback, useEffect, useState } from 'react';

const LOAD_REMOTELY_TIMEOUT_MS = 5_000;

export interface NotebookProps {
  notebookId: string;
  readOnly: boolean;
  isWriter: boolean;
  icon: ReactNode;
  topbar: ReactNode;
  secret?: string;
  onEditor: (editor: PlateEditor) => void;
  onDocsync: (docsync: DocSyncEditor) => void;
}

export const Notebook = ({
  notebookId,
  readOnly,
  isWriter,
  icon,
  secret,
  topbar,
  onEditor,
  onDocsync,
}: NotebookProps) => {
  // Computer
  const [computer] = useState(() => new Computer());

  // Editor
  const editor = useCreateEditor({
    notebookId,
    computer,
    isWriter,
  });

  useEffect(() => {
    onEditor(editor);
  }, [editor, onEditor]);

  // DocSync
  const [loaded, setLoaded] = useState(false);
  const [loadedLocally, setLoadedLocally] = useState(false);
  const onLoaded: OnLoadedCallback = useCallback((source) => {
    if (source === 'remote') {
      setLoaded(true);
    } else if (source === 'local') {
      setLoadedLocally(true);
    }
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (!loaded && loadedLocally) {
      timeout = setTimeout(() => {
        if (!loaded) {
          setLoaded(true);
        }
      }, LOAD_REMOTELY_TIMEOUT_MS);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [loaded, loadedLocally]);

  // Doc sync

  const docsync = useDocSync({
    notebookId,
    editor,
    authSecret: secret,
    onError: captureException,
    onLoaded,
    readOnly,
  });

  useEffect(() => {
    if (docsync) {
      onDocsync(docsync);
    }
  }, [docsync, onDocsync]);

  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  useEffect(() => {
    const subscription = docsync
      ?.hasLocalChanges()
      .subscribe(setHasLocalChanges);
    return () => {
      subscription?.unsubscribe();
    };
  }, [docsync]);

  // User warning

  const toast = useToast();
  const [session] = useSession();
  const warning: string | false =
    readOnly &&
    `Changes to this notebook are not saved.${
      (session?.user &&
        'Please Duplicate to customize and make it your own.') ||
      ''
    }`;
  const [toastedWarning, setToastedWarning] = useState(false);

  useEffect(() => {
    if (warning && hasLocalChanges && !toastedWarning) {
      setToastedWarning(true);
      toast(warning as string, 'warning', { autoDismiss: false });
    }
  }, [editor, hasLocalChanges, loaded, toast, toastedWarning, warning]);

  return (
    <ComputerContextProvider computer={computer}>
      <EditorReadOnlyContext.Provider value={false}>
        <ResultsContext.Provider value={computer.results.asObservable()}>
          <NotebookPage
            notebook={
              <Editor
                notebookId={notebookId}
                loaded={loaded}
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
  );
};
