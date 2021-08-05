import { ResultsContextProvider } from '@decipad/ui';
import { Plate, useStoreEditorRef } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { FC, useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DropFile } from './components/DropFile';
import { FormattingToolbar } from './components/FormattingToolbar';
import { components, options, plugins } from './configuration';
import { useDocSyncPlugin } from './plugins/DocSync/useDocSyncPlugin';
import { useLanguagePlugin } from './plugins/Language/useLanguagePlugin';
import { useNotebookTitlePlugin } from './plugins/NotebookTitle/useNotebookTitlePlugin';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';

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

  const editorPlugins = useMemo(
    () => [
      ...plugins,
      slashCommandsPlugin,
      languagePlugin,
      docSyncPlugin,
      notebookTitlePlugin,
    ],
    [slashCommandsPlugin, languagePlugin, docSyncPlugin, notebookTitlePlugin]
  );

  return (
    <ResultsContextProvider value={results}>
      <DropFile editor={editor}>
        <Plate
          id={editorId}
          plugins={editorPlugins}
          options={options}
          components={components}
          editableProps={{ autoFocus }}
        >
          <FormattingToolbar />
          <SlashCommandsSelect {...getSlashCommandsProps()} />
        </Plate>
      </DropFile>
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
