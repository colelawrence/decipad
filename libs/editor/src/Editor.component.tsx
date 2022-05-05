import {
  useDocSync,
  useNotebookTitlePlugin,
  useUploadDataPlugin,
} from '@decipad/editor-plugins';
import {
  ComputerContextProvider,
  ResultsContext,
  useComputer,
} from '@decipad/react-contexts';
import { EditorPlaceholder } from '@decipad/ui';
import { captureException } from '@sentry/react';
import { createPlateEditor, Plate, PlateProvider } from '@udecode/plate';
import { FC, useCallback, useMemo, useState } from 'react';
import * as components from './components';
import * as configuration from './configuration';

export interface EditorProps {
  notebookId: string;
  readOnly: boolean;
  authSecret?: string;
}

const EditorInternal = ({ notebookId, authSecret, readOnly }: EditorProps) => {
  const [editorLoaded, setEditorLoaded] = useState(false);

  const computer = useComputer();

  const onLoaded = useCallback(() => {
    setEditorLoaded(true);
  }, []);

  // Cursor remote presence
  // useCursors(editor);

  const notebookTitlePlugin = useNotebookTitlePlugin({
    notebookId,
    readOnly,
  });

  const editorPlugins = useMemo(
    () => [...configuration.plugins(computer), notebookTitlePlugin],
    [computer, notebookTitlePlugin]
  );

  const editor = useMemo(
    () =>
      createPlateEditor({
        id: notebookId,
        plugins: editorPlugins,
      }),
    [editorPlugins, notebookId]
  );

  // DocSync
  useDocSync({
    notebookId,
    editor,
    authSecret,
    onError: captureException,
    onLoaded,
  });

  // upload / fetch data
  const {
    startUpload,
    uploadState,
    clearAll: clearAllUploads,
  } = useUploadDataPlugin({ editor });

  return (
    <ResultsContext.Provider value={computer.results.asObservable()}>
      <components.DropFile
        editor={editor}
        startUpload={startUpload}
        notebookId={notebookId}
      >
        {!editorLoaded && <EditorPlaceholder />}
        <div css={{ display: editorLoaded ? 'unset' : 'none' }}>
          <Plate
            editor={editor}
            editableProps={{
              readOnly,
            }}
          >
            <components.Tooltip />
            <components.UploadDialogue
              uploadState={uploadState}
              clearAll={clearAllUploads}
            />
          </Plate>
        </div>
      </components.DropFile>
    </ResultsContext.Provider>
  );
};

export const Editor = (props: EditorProps): ReturnType<FC> => {
  return (
    <PlateProvider id={props.notebookId}>
      <ComputerContextProvider>
        <EditorInternal key={props.notebookId} {...props} />
      </ComputerContextProvider>
    </PlateProvider>
  );
};
