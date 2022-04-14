import { Editor as TEditor } from '@decipad/editor-types';
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
import {
  useDocSync,
  useNotebookTitlePlugin,
  useUploadDataPlugin,
  useExternalDataPlugin,
} from '@decipad/editor-plugins';
import { captureException } from '@sentry/react';
import { Plate, PlateProvider, createPlateEditor } from '@udecode/plate';
import { useSlateStatic } from 'slate-react';
import { FC, useEffect, useMemo, useState } from 'react';
import { DropFile, Tooltip, UploadDialogue } from './components';
import * as configuration from './configuration';
import { useLanguagePlugin } from './plugins';
import { editorProgramBlocks } from './utils/editorProgramBlocks';

export interface EditorProps {
  notebookId: string;
  readOnly: boolean;
  authSecret?: string;
}

const EditorInternal = ({ notebookId, authSecret }: EditorProps) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const editor = useSlateStatic();

  // DocSync
  const docsyncEditor = useDocSync({
    notebookId,
    editor: editor as unknown as TEditor,
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

  // upload / fetchdata

  const { createOrUpdateExternalData } = useExternalDataPlugin({
    editor: docsyncEditor,
  });

  const {
    startUpload,
    uploadState,
    clearAll: clearAllUploads,
  } = useUploadDataPlugin({ editor });

  return (
    <ExternalAuthenticationContextProvider
      value={{ createOrUpdateExternalData }}
    >
      <DropFile
        editor={editor}
        startUpload={startUpload}
        notebookId={notebookId}
      >
        <UploadDialogue uploadState={uploadState} clearAll={clearAllUploads} />

        {!editorLoaded && <EditorPlaceholder />}
      </DropFile>
    </ExternalAuthenticationContextProvider>
  );
};

const EditorWithResults = (props: EditorProps): ReturnType<FC> => {
  const computer = useComputer();

  const notebookTitlePlugin = useNotebookTitlePlugin(props);
  const languagePlugin = useLanguagePlugin();

  const editorPlugins = useMemo(
    () => [...configuration.plugins, languagePlugin, notebookTitlePlugin],
    [languagePlugin, notebookTitlePlugin]
  );

  const editor = createPlateEditor({
    id: props.notebookId,
    plugins: editorPlugins,
  });

  const programBlocks = editorProgramBlocks(editor);

  return (
    <ProgramBlocksContextProvider value={programBlocks}>
      <ResultsContext.Provider value={computer.results.asObservable()}>
        <Plate editor={editor} editableProps={{ readOnly: props.readOnly }}>
          <EditorInternal {...props}></EditorInternal>
          <Tooltip />
        </Plate>
      </ResultsContext.Provider>
    </ProgramBlocksContextProvider>
  );
};

export const EditorWithComputer = (props: EditorProps): ReturnType<FC> => {
  return (
    <ComputerContextProvider>
      <PlateProvider id={props.notebookId}>
        <EditorWithResults {...props} />
      </PlateProvider>
    </ComputerContextProvider>
  );
};

export const Editor = EditorWithComputer;
