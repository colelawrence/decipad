import {
  ResultsContext,
  ComputerContextProvider,
  useComputer,
} from '@decipad/react-contexts';
import {
  EditorPlaceholder,
  ExternalAuthenticationContextProvider,
  ProgramBlocksContextProvider,
} from '@decipad/ui';
import { identity } from '@decipad/utils';
import {
  useDocSync,
  useNotebookTitlePlugin,
  useUploadDataPlugin,
  useExternalDataPlugin,
} from '@decipad/editor-plugins';
import { captureException } from '@sentry/react';
import {
  Plate,
  PlateProvider,
  usePlateEditorRef,
  TEditor,
} from '@udecode/plate';
import { FC, useEffect, useMemo, useState } from 'react';
import * as components from './components';
import * as configuration from './configuration';
import { useLanguagePlugin } from './plugins';
import { editorProgramBlocks } from './utils/editorProgramBlocks';

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

  // DocSync
  const docsyncEditor = useDocSync({
    notebookId,
    editor,
    authSecret,
    onError: captureException,
  });

  useEffect(() => {
    if (docsyncEditor) {
      docsyncEditor.onLoaded(() => {
        setEditorLoaded(true);
      });
      return () => {
        docsyncEditor.disconnect();
        docsyncEditor.destroy();
      };
    }
    return undefined;
  }, [docsyncEditor]);

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
  const { createOrUpdateExternalData } = useExternalDataPlugin({
    editor: docsyncEditor,
  });

  const editorPlugins = useMemo(
    () => [...configuration.plugins, languagePlugin, notebookTitlePlugin],
    [languagePlugin, notebookTitlePlugin]
  );

  const programBlocks = docsyncEditor ? editorProgramBlocks(editor) : {};

  return (
    <ResultsContext.Provider value={computer.results.asObservable()}>
      <ProgramBlocksContextProvider value={programBlocks}>
        <ExternalAuthenticationContextProvider
          value={{ createOrUpdateExternalData }}
        >
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
        </ExternalAuthenticationContextProvider>
      </ProgramBlocksContextProvider>
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
