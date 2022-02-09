import { FC, useMemo, useState, useEffect } from 'react';
import { captureException } from '@sentry/react';
import { identity } from '@decipad/utils';
import {
  ProgramBlocksContextProvider,
  ExternalAuthenticationContextProvider,
} from '@decipad/ui';
import { ResultsContext } from '@decipad/react-contexts';
import { Plate, PlatePluginComponent, useStoreEditorRef } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { components, options, plugins } from './configuration';
import { useDocSync } from './plugins/DocSync/useDocSync';
import {
  editorProgramBlocks,
  useLanguagePlugin,
} from './plugins/Language/useLanguagePlugin';
import { useNotebookTitlePlugin } from './plugins/NotebookTitle/useNotebookTitlePlugin';
import { UploadDialogue } from './plugins/UploadData/components/UploadDialogue';
import { useFetchDataPlugin } from './plugins/FetchData/useFetchDataPlugin';
import { useExternalDataPlugin } from './plugins/ExternalData/useExternalDataPlugin';
import { useUploadDataPlugin } from './plugins/UploadData/useUploadDataPlugin';
import { DropFile, Tooltip } from './components';
import { ComputerContextProvider } from './contexts/Computer';

export interface EditorProps {
  padId: string;
  readOnly: boolean;
  authSecret?: string;
}

const LoadingEditable = (): ReturnType<FC> => <>Loading editor...</>;
const renderLoadingEditable = () => <LoadingEditable />;

const EditorInternal = ({ padId, authSecret, readOnly }: EditorProps) => {
  const [editorId] = useState(nanoid);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const editor = useStoreEditorRef(editorId);

  const { results, languagePlugin } = useLanguagePlugin({
    ready: editorLoaded,
  });

  // DocSync
  const docsyncEditor = useDocSync({
    padId,
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
    padId,
    readOnly,
    ready: editorLoaded,
  });

  // upload / fetchdata
  const {
    startUpload,
    uploadState,
    clearAll: clearAllUploads,
  } = useUploadDataPlugin({ editor });
  const fetchDataPlugin = useFetchDataPlugin();
  const { createOrUpdateExternalData } = useExternalDataPlugin({
    editor: docsyncEditor,
  });

  const editorPlugins = useMemo(
    () => [...plugins, languagePlugin, notebookTitlePlugin, fetchDataPlugin],
    [languagePlugin, notebookTitlePlugin, fetchDataPlugin]
  );

  const programBlocks = docsyncEditor ? editorProgramBlocks(docsyncEditor) : {};

  return (
    <ResultsContext.Provider value={results}>
      <ProgramBlocksContextProvider value={programBlocks}>
        <ExternalAuthenticationContextProvider
          value={{ createOrUpdateExternalData }}
        >
          <DropFile
            editor={docsyncEditor}
            startUpload={startUpload}
            padId={padId}
          >
            <Plate
              id={editorId}
              renderEditable={editorLoaded ? identity : renderLoadingEditable}
              plugins={editorPlugins}
              options={options}
              components={components as Record<string, PlatePluginComponent>}
              editableProps={{ readOnly }}
            >
              <Tooltip />
              <UploadDialogue
                uploadState={uploadState}
                clearAll={clearAllUploads}
              />
            </Plate>
          </DropFile>
        </ExternalAuthenticationContextProvider>
      </ProgramBlocksContextProvider>
    </ResultsContext.Provider>
  );
};

export const Editor = (props: EditorProps): ReturnType<FC> => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ComputerContextProvider>
        <EditorInternal key={props.padId} {...props} />
      </ComputerContextProvider>
    </DndProvider>
  );
};
