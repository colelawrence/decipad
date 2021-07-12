import React, { useMemo, useState } from 'react';
import { createEditor, Node } from 'slate';
import styled from '@emotion/styled';
import { SlatePlugins, pipe, withSlatePlugins } from '@udecode/slate-plugins';
import { Box, Container } from '@chakra-ui/react';
import { ResultsContextProvider } from '@decipad/ui';
import { SideFormattingMenu } from './components/SideFormattingMenu';
import { DropFile } from './components/DropFile';
import { components, options, plugins } from './configuration';
import {
  SlashCommandsSelect,
  useSlashCommandsPlugin,
} from './plugins/SlashCommands';
import { useEditor } from './hooks/useEditor';

export { RuntimeProvider, AnonymousRuntimeProvider } from './contexts/Runtime';

const Wrapper = styled('div')`
  padding-top: 25px;
`;

export const Editor = ({ padId, autoFocus }: { padId: string, autoFocus: boolean }) => {
  const [value, setValue] = useState<Node[] | undefined>(undefined);

  const { getSlashCommandsProps, plugin: slashCommandsPlugin } =
    useSlashCommandsPlugin();

  const editorPlugins = useMemo(
    () => [...plugins, slashCommandsPlugin],
    [slashCommandsPlugin]
  );

  const editor = useState(() => pipe(
    createEditor(),
    withSlatePlugins({
      id: padId,
      plugins: editorPlugins,
      options,
      components,
    })))[0];

  const { onChangeLanguage, results } = useEditor({
    padId,
    editor,
    setValue,
  });

  return (
    <ResultsContextProvider key={padId} value={results}>
      <Box pb="70px" w="100vw" pos="relative">
        <Container maxW="75ch">
          { value && editor ? (
            <DropFile editor={editor}>
              <Wrapper>
                <SlatePlugins
                  value={value}
                  id={padId}
                  editor={editor}
                  plugins={editorPlugins}
                  options={options}
                  components={components}
                  editableProps={{ autoFocus }}
                  onChange={() => onChangeLanguage(editor.children) }
                />
                <SlashCommandsSelect {...getSlashCommandsProps()} />
                <SideFormattingMenu />
              </Wrapper>
            </DropFile>)
          : <span>Loading...</span> }
        </Container>
      </Box>
    </ResultsContextProvider>
  );
};


