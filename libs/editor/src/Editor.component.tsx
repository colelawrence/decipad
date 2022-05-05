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
import { Plate, PlateProvider, usePlateEditorRef } from '@udecode/plate';
import { FC, useCallback, useMemo, useState } from 'react';
import * as components from './components';
import * as configuration from './configuration';

export interface EditorProps {
  notebookId: string;
  readOnly: boolean;
  authSecret?: string;
}

type InsidePlateProps = EditorProps & {
  onLoaded: () => void;
};

const InsidePlate = ({
  notebookId,
  authSecret,
  onLoaded,
}: InsidePlateProps) => {
  const editor = usePlateEditorRef();
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
    <>
      <components.Tooltip />
      <components.DropFile
        editor={editor}
        startUpload={startUpload}
        notebookId={notebookId}
      />
      <components.UploadDialogue
        uploadState={uploadState}
        clearAll={clearAllUploads}
      />
    </>
  );
};

const EditorInternal = (props: EditorProps) => {
  const { notebookId, readOnly } = props;
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

  return (
    <ResultsContext.Provider value={computer.results.asObservable()}>
      {!editorLoaded && <EditorPlaceholder />}
      <div css={{ display: editorLoaded ? 'unset' : 'none' }}>
        <Plate
          id={notebookId}
          plugins={editorPlugins}
          editableProps={{
            readOnly,
          }}
        >
          <InsidePlate {...props} onLoaded={onLoaded} />
        </Plate>
      </div>
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
