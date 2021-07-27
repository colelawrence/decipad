import { ResultsContextProvider } from '@decipad/ui';
import styled from '@emotion/styled';
import { pipe, SlatePlugins, withSlatePlugins } from '@udecode/slate-plugins';
import { useMemo, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createEditor, Node } from 'slate';
import { DropFile } from './components/DropFile';
import { FormattingToolbar } from './components/FormattingToolbar';
import { components, options, plugins } from './configuration';
import { useEditor } from './hooks/useEditor';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';
import { useNotebookTitlePlugin } from './plugins/Title/useNotebookTitlePlugin';

export { AnonymousDocSyncProvider, DocSyncProvider } from './contexts/DocSync';

const Wrapper = styled('div')({
  padding: '25px 0 70px 0',
  width: '100vw',
  position: 'relative',
});

const InnerContent = styled('div')({
  maxWidth: '75ch',
  margin: 'auto',
});

export interface EditorProps {
  padId: string;
  autoFocus: boolean;
}

const SlateEditor = ({ padId, autoFocus }: EditorProps) => {
  const editor = useMemo(() => pipe(createEditor(), withSlatePlugins()), []);
  const [value, setValue] = useState<Node[] | undefined>(undefined);

  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const { plugin: notebookTitlePlugin } = useNotebookTitlePlugin({ padId });

  const editorPlugins = useMemo(
    () => [...plugins, slashCommandsPlugin, notebookTitlePlugin],
    [slashCommandsPlugin, notebookTitlePlugin]
  );

  const { onChangeLanguage, results } = useEditor({
    padId,
    editor,
    setValue,
  });

  return (
    <ResultsContextProvider key={padId} value={results}>
      <Wrapper>
        <InnerContent>
          {value && editor ? (
            <DropFile editor={editor}>
              <SlatePlugins
                value={value}
                id={padId}
                editor={editor}
                plugins={editorPlugins}
                options={options}
                components={components}
                editableProps={{ autoFocus }}
                onChange={() => onChangeLanguage(editor.children)}
              />
              <FormattingToolbar />
              <SlashCommandsSelect {...getSlashCommandsProps()} />
            </DropFile>
          ) : (
            <span>Loading...</span>
          )}
        </InnerContent>
      </Wrapper>
    </ResultsContextProvider>
  );
};

export const Editor = (props: EditorProps) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <SlateEditor {...props} />
    </DndProvider>
  );
};
