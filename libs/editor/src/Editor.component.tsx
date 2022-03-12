import { ResultsContext } from '@decipad/react-contexts';
import {
  ExternalAuthenticationContextProvider,
  ProgramBlocksContextProvider,
} from '@decipad/ui';
import { identity } from '@decipad/utils';
import { captureException } from '@sentry/react';
import { Plate, PlatePluginComponent } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { FC, useEffect, useMemo, useState } from 'react';
import { DropFile, Tooltip } from './components';
import { components, options, plugins } from './configuration';
import { ComputerContextProvider } from './contexts/Computer';
import { useDocSync } from './plugins/DocSync/useDocSync';
import { useExternalDataPlugin } from './plugins/ExternalData/useExternalDataPlugin';
import { useFetchDataPlugin } from './plugins/FetchData/useFetchDataPlugin';
import {
  editorProgramBlocks,
  useLanguagePlugin,
} from './plugins/Language/useLanguagePlugin';
import { useNotebookTitlePlugin } from './plugins/NotebookTitle/useNotebookTitlePlugin';
import { UploadDialogue } from './plugins/UploadData/components/UploadDialogue';
import { useUploadDataPlugin } from './plugins/UploadData/useUploadDataPlugin';
import { useStoreEditorRef } from './utils/useStoreEditorRef';

export interface EditorProps {
  notebookId: string;
  readOnly: boolean;
  authSecret?: string;
}

const LoadingEditable = (): ReturnType<FC> => <>Loading editor...</>;
const renderLoadingEditable = () => <LoadingEditable />;

const EditorInternal = ({ notebookId, authSecret, readOnly }: EditorProps) => {
  const [editorId] = useState(nanoid);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const editor = useStoreEditorRef(editorId);

  const { results, languagePlugin } = useLanguagePlugin();

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

  const notebookTitlePlugin = useNotebookTitlePlugin({ notebookId, readOnly });

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
            notebookId={notebookId}
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
    <ComputerContextProvider>
      <EditorInternal key={props.notebookId} {...props} />
    </ComputerContextProvider>
  );
};
