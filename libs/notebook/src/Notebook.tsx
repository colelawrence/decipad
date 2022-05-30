import { DocSyncEditor, OnLoadedCallback } from '@decipad/docsync';
import { Editor, useCreateEditor } from '@decipad/editor';
import { useDocSync } from '@decipad/editor-plugins';
import { Computer } from '@decipad/computer';
import {
  ComputerContextProvider,
  EditorReadOnlyContext,
  ResultsContext,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { NotebookPage } from '@decipad/ui';
import { captureException } from '@sentry/browser';
import { useSession } from 'next-auth/client';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { MyEditor } from '@decipad/editor-types';
import { createEditor } from 'slate';

const LOAD_REMOTELY_TIMEOUT_MS = 5_000;

export interface NotebookProps {
  notebookId: string;
  readOnly: boolean;
  icon: ReactNode;
  topbar: ReactNode;
  secret?: string;
  onEditor: (editor: MyEditor) => void;
  onDocsync: (docsync: DocSyncEditor) => void;
}

export const Notebook = ({
  notebookId,
  readOnly,
  icon,
  secret,
  topbar,
  onEditor,
  onDocsync,
}: NotebookProps) => {
  // Computer
  const [computer] = useState(() => new Computer());

  const [slateBaseEditor] = useState(createEditor);

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
    editor: slateBaseEditor as MyEditor,
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
    `Changes to this notebook are not saved${
      (session?.user &&
        '. Please duplicate to customize and make it your own.') ||
      ''
    }`;
  const [toastedWarning, setToastedWarning] = useState(false);

  // Editor
  // Needs to be created last so other editor (e.g. docsync editor) wrapping editor functions
  // (e.g. apply, onChange) can be called with the latest values transformed via plugins. Things
  // get called from the outside in.
  const editor = useCreateEditor({
    editor: docsync,
    notebookId,
    computer,
    readOnly,
  });

  useEffect(() => {
    onEditor(editor);
  }, [editor, onEditor]);

  useEffect(() => {
    if (warning && hasLocalChanges && !toastedWarning) {
      setToastedWarning(true);
      toast(warning as string, 'warning', { autoDismiss: false });
    }
  }, [editor, hasLocalChanges, loaded, toast, toastedWarning, warning]);

  const computerObservable = useMemo(
    () => computer.results.asObservable(),
    [computer.results]
  );

  return (
    <ComputerContextProvider computer={computer}>
      <EditorReadOnlyContext.Provider value={readOnly}>
        <ResultsContext.Provider value={computerObservable}>
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
