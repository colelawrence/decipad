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
import { identity } from '@decipad/utils';
import { captureException } from '@sentry/react';
import {
  Plate,
  PlateProvider,
  TEditor,
  usePlateEditorRef,
} from '@udecode/plate';
import { FC, useCallback, useMemo, useState } from 'react';
import * as components from './components';
import * as configuration from './configuration';
import { useLanguagePlugin } from './plugins';

export interface EditorProps {
  notebookId: string;
  readOnly: boolean;
  authSecret?: string;
}

const EditorInternal = ({ notebookId, authSecret, readOnly }: EditorProps) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const editor = usePlateEditorRef(notebookId) as TEditor;

  const languagePlugin = useLanguagePlugin();
  const computer = useComputer();

  const onLoaded = useCallback(() => {
    setEditorLoaded(true);
  }, []);

  // DocSync
  useDocSync({
    notebookId,
    editor,
    authSecret,
    onError: captureException,
    onLoaded,
  });

  // Cursor remote presence
  // useCursors(editor);

  const notebookTitlePlugin = useNotebookTitlePlugin({
    notebookId,
    readOnly,
  });

  // upload / fetchdata
  const {
    startUpload,
    uploadState,
    clearAll: clearAllUploads,
  } = useUploadDataPlugin({ editor });

  const editorPlugins = useMemo(
    () => [...configuration.plugins, languagePlugin, notebookTitlePlugin],
    [languagePlugin, notebookTitlePlugin]
  );

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
            id={notebookId}
            renderEditable={identity}
            plugins={editorPlugins}
            editableProps={{ readOnly }}
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
