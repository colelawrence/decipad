import { FC, useMemo, useState } from 'react';
import {
  ProgramBlocksContextProvider,
  ResultsContextProvider,
  ExternalAuthenticationContextProvider,
} from '@decipad/ui';
import { Plate, useStoreEditorRef } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DropFile } from './components/DropFile';
import { Tooltip } from './components/Tooltip/Tooltip';
import { components, options, plugins } from './configuration';
import { useDocSyncPlugin } from './plugins/DocSync/useDocSyncPlugin';
import {
  editorProgramBlocks,
  useLanguagePlugin,
} from './plugins/Language/useLanguagePlugin';
import { useNotebookTitlePlugin } from './plugins/NotebookTitle/useNotebookTitlePlugin';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';
import { UploadDialogue } from './plugins/UploadData/components/UploadDialogue';
import { useImportDataPlugin } from './plugins/ImportData/useImportDataPlugin';
import { useExternalDataPlugin } from './plugins/ExternalData/useExternalDataPlugin';
import { useUploadDataPlugin } from './plugins/UploadData/useUploadDataPlugin';

export { AnonymousDocSyncProvider, DocSyncProvider } from './contexts/DocSync';

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
  const editor = useStoreEditorRef(editorId);

  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const { results, languagePlugin } = useLanguagePlugin();

  const docSyncPlugin = useDocSyncPlugin({
    padId,
    authSecret,
    editor,
    readOnly,
  });

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
    () => [
      ...plugins,
      slashCommandsPlugin,
      languagePlugin,
      docSyncPlugin,
      notebookTitlePlugin,
      importDataPlugin,
    ],
    [
      slashCommandsPlugin,
      languagePlugin,
      docSyncPlugin,
      notebookTitlePlugin,
      importDataPlugin,
    ]
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
              <SlashCommandsSelect {...getSlashCommandsProps()} />
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
      <SlateEditor key={props.padId} {...props} />
    </DndProvider>
  );
};
