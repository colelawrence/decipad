import { FC, useMemo, useState, useEffect } from 'react';
import {
  ProgramBlocksContextProvider,
  ResultsContextProvider,
  ExternalAuthenticationContextProvider,
} from '@decipad/ui';
import { Plate, useStoreEditorRef } from '@udecode/plate';
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
import { useImportDataPlugin } from './plugins/ImportData/useImportDataPlugin';
import { useExternalDataPlugin } from './plugins/ExternalData/useExternalDataPlugin';
import { useUploadDataPlugin } from './plugins/UploadData/useUploadDataPlugin';
import { DropFile, Tooltip } from './components';
import { ComputerContextProvider } from './contexts/Computer';

export interface EditorProps {
  padId: string;
  readOnly: boolean;
  authSecret?: string;
  autoFocus: boolean;
}

// TODO how to figure out when we have read only permissions on the pad

const SlateEditor = ({
  padId,
  authSecret,
  autoFocus,
  readOnly,
}: EditorProps) => {
  const [editorId] = useState(nanoid);
  const editor1 = useStoreEditorRef(editorId);

  const { results, languagePlugin } = useLanguagePlugin();

  // DocSync
  const editor = useDocSync({
    padId,
    editor: editor1,
    authSecret,
  });

  useEffect(() => {
    return () => {
      if (editor) {
        editor.disconnect();
        editor.destroy();
      }
    };
  }, [editor]);

  // Cursor remote presence
  // useCursors(editor);

  const notebookTitlePlugin = useNotebookTitlePlugin({ padId });

  // upload / import data
  const {
    startUpload,
    uploadState,
    clearAll: clearAllUploads,
  } = useUploadDataPlugin({ editor });
  const importDataPlugin = useImportDataPlugin();
  const { createOrUpdateExternalData } = useExternalDataPlugin({ editor });

  const editorPlugins = useMemo(
    () => [...plugins, languagePlugin, notebookTitlePlugin, importDataPlugin],
    [languagePlugin, notebookTitlePlugin, importDataPlugin]
  );

  const programBlocks = editor ? editorProgramBlocks(editor) : {};

  return (
    <ResultsContextProvider value={results}>
      <ProgramBlocksContextProvider value={programBlocks}>
        <ExternalAuthenticationContextProvider
          value={{ createOrUpdateExternalData }}
        >
          <DropFile editor={editor} startUpload={startUpload} padId={padId}>
            <Plate
              id={editorId}
              plugins={editorPlugins}
              options={options}
              components={components}
              editableProps={{ autoFocus, readOnly }}
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
    </ResultsContextProvider>
  );
};

export const Editor = (props: EditorProps): ReturnType<FC> => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ComputerContextProvider>
        <SlateEditor key={props.padId} {...props} />
      </ComputerContextProvider>
    </DndProvider>
  );
};
