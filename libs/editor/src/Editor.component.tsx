import { plugins } from '@decipad/editor-config';
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
import * as components from './components';
import * as configuration from './configuration';
import { ComputerContextProvider, useComputer } from './contexts';
import { Tooltip, UploadDialogue } from './plate-components';
import {
  editorProgramBlocks,
  useLanguagePlugin,
  useCodeVariableHighlightingPlugin,
} from './plugins';
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

  const languagePlugin = useLanguagePlugin();
  const variableHighlightPlugin = useCodeVariableHighlightingPlugin();
  const computer = useComputer();

  // DocSync
  const docsyncEditor = plugins.useDocSync({
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

  const notebookTitlePlugin = plugins.useNotebookTitlePlugin({
    notebookId,
    readOnly,
  });

  // upload / fetchdata
  const {
    startUpload,
    uploadState,
    clearAll: clearAllUploads,
  } = plugins.useUploadDataPlugin({ editor });
  const { createOrUpdateExternalData } = plugins.useExternalDataPlugin({
    editor: docsyncEditor,
  });

  const editorPlugins = useMemo(
    () => [
      ...configuration.plugins,
      languagePlugin,
      variableHighlightPlugin,
      notebookTitlePlugin,
    ],
    [languagePlugin, variableHighlightPlugin, notebookTitlePlugin]
  );

  const programBlocks = docsyncEditor ? editorProgramBlocks(docsyncEditor) : {};

  return (
    <ResultsContext.Provider value={computer.results.asObservable()}>
      <ProgramBlocksContextProvider value={programBlocks}>
        <ExternalAuthenticationContextProvider
          value={{ createOrUpdateExternalData }}
        >
          <components.DropFile
            editor={docsyncEditor}
            startUpload={startUpload}
            notebookId={notebookId}
          >
            <Plate
              id={editorId}
              renderEditable={editorLoaded ? identity : renderLoadingEditable}
              plugins={editorPlugins}
              options={configuration.options}
              components={
                configuration.components as Record<string, PlatePluginComponent>
              }
              editableProps={{ readOnly }}
            >
              <Tooltip />
              <UploadDialogue
                uploadState={uploadState}
                clearAll={clearAllUploads}
              />
            </Plate>
          </components.DropFile>
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
