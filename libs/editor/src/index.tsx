import { ResultsContextProvider } from '@decipad/ui';
import styled from '@emotion/styled';
import { pipe, SlatePlugins, withSlatePlugins } from '@udecode/slate-plugins';
import React, { useMemo, useState } from 'react';
import { createEditor, Node } from 'slate';
import { DropFile } from './components/DropFile';
import { SideFormattingMenu } from './components/SideFormattingMenu';
import { components, options, plugins } from './configuration';
import { useEditor } from './hooks/useEditor';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';

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

export const Editor = ({ padId, autoFocus }: EditorProps) => {
  const editor = useMemo(() => pipe(createEditor(), withSlatePlugins()), []);
  const [value, setValue] = useState<Node[] | undefined>(undefined);

  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const editorPlugins = useMemo(
    () => [...plugins, slashCommandsPlugin],
    [slashCommandsPlugin]
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
              <SlashCommandsSelect {...getSlashCommandsProps()} />
              <SideFormattingMenu />
            </DropFile>
          ) : (
            <span>Loading...</span>
          )}
        </InnerContent>
      </Wrapper>
    </ResultsContextProvider>
  );
};
