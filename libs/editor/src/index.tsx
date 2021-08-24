import {
  ProgramBlocksContextProvider,
  ResultsContextProvider,
} from '@decipad/ui';
import { Plate, useStoreEditorRef } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { FC, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DropFile } from './components/DropFile';
import { Tooltip } from './components/Tooltip/Tooltip';
import { components, options, plugins } from './configuration';
import { useDocSyncPlugin } from './plugins/DocSync/useDocSyncPlugin';
import { useImportDataPlugin } from './plugins/ImportData/useImportDataPlugin';
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
import { useUploadDataPlugin } from './plugins/UploadData/useUploadDataPlugin';

export { AnonymousDocSyncProvider, DocSyncProvider } from './contexts/DocSync';

export interface EditorProps {
  padId: string;
  autoFocus: boolean;
}

const SlateEditor = ({ padId, autoFocus }: EditorProps) => {
  const [editorId] = useState(nanoid);
  const editor = useStoreEditorRef(editorId);

  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const { results, languagePlugin } = useLanguagePlugin();

  const docSyncPlugin = useDocSyncPlugin({ padId, editor });

  const notebookTitlePlugin = useNotebookTitlePlugin({ padId });

  // upload / import data
  const {
    startUpload,
    uploadState,
    clearAll: clearAllUploads,
  } = useUploadDataPlugin({ editor });
  const importDataPlugin = useImportDataPlugin();

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
        <DropFile editor={editor} startUpload={startUpload} padId={padId}>
          <Plate
            id={editorId}
            plugins={editorPlugins}
            options={options}
            components={components}
            editableProps={{ autoFocus }}
          >
            <Tooltip />
            <SlashCommandsSelect {...getSlashCommandsProps()} />
            <UploadDialogue
              uploadState={uploadState}
              clearAll={clearAllUploads}
            />
          </Plate>
        </DropFile>
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
