import { Box, Button, Container, Icon } from '@chakra-ui/react';
import { Blocks, Leaves } from '@decipad/ui';
import { EditablePlugins, pipe } from '@udecode/slate-plugins';
import dynamic from 'next/dynamic';
import { FiPlus } from 'react-icons/fi';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Node, createEditor, Transforms } from 'slate';
import { ReactEditor, Slate, Transforms } from 'slate-react';
import { ResultsContextProvider } from '@decipad/ui';
import { DropFile } from './Components/DropFile';
import { useEditor } from './Hooks/useEditor';
import { plugins, withPlugins } from './Plugins';
import { commands } from './Plugins/DashCommands/commands';
import { DashCommandsPortalProps } from './Plugins/DashCommands/DashCommandsPortal';
import { useDashCommands } from './Plugins/DashCommands/useDashCommands';
import { HoveringToolbar } from './Plugins/HoveringToolbar/HoveringToolbar.component';
import { MentionPortalProps } from './Plugins/MentionPlugin/MentionPortal.component';
import { useMention } from './Plugins/MentionPlugin/useMention';
import { users } from './Plugins/MentionPlugin/users';

const DashCommandsPortal = dynamic<DashCommandsPortalProps>(
  () =>
    import('./Plugins/DashCommands/DashCommandsPortal').then(
      (res) => res.DashCommandsPortal
    ),
  { ssr: false }
);

const MentionPortal = dynamic<MentionPortalProps>(
  () =>
    import('./Plugins/MentionPlugin/MentionPortal.component').then(
      (res) => res.MentionPortal
    ),
  { ssr: false }
);

interface DeciEditorProps {
  padId: string;
}

export const DeciEditor = ({ padId }: DeciEditorProps): JSX.Element => {
  const [value, setValue] = useState<Node[] | null>(null);
  const editor = useState(
    (): ReactEditor => pipe(createEditor(), ...withPlugins)
  )[0];
  const { onChangeLanguage, results } = useEditor({ padId, editor, setValue });

  const {
    onAddElement,
    onChangeDashCommands,
    onKeyDownDashCommands,
    search,
    index,
    target,
    values,
  } = useDashCommands(commands);

  const {
    target: mentionTarget,
    search: mentionSearch,
    index: mentionIndex,
    onChangeMention,
    onKeyDownMention,
    filteredUsers,
  } = useMention(users);

  const onChange = useCallback(
    (newValue: Node[]) => {
      onChangeDashCommands(editor);
      onChangeMention(editor);
      onChangeLanguage();
      setValue(newValue);
    },
    [editor, onChangeDashCommands, onChangeMention, onChangeLanguage, setValue]
  );

  const editablePlugins = useMemo(
    () => (
      <EditablePlugins
        autoFocus={true}
        style={{ height: '100%' }}
        plugins={plugins}
        renderElement={[Blocks]}
        renderLeaf={[Leaves]}
        onKeyDown={[onKeyDownDashCommands, onKeyDownMention]}
        onKeyDownDeps={[
          index,
          search,
          target,
          mentionIndex,
          mentionSearch,
          mentionTarget,
        ]}
        placeholder={`Type "/" for commands`}
      />
    ),
    [
      onKeyDownDashCommands,
      onKeyDownMention,
      index,
      search,
      target,
      mentionIndex,
      mentionSearch,
      mentionTarget,
    ]
  );

  useEffect(() => {
    if (value != null) {
      // We don't always want to focus the editor, such as in docs.
      ReactEditor.focus(editor as any);
    }
  }, [value])

  if (value == null) {
    return <Box><span>Loading...</span></Box>
  } else {
    return (
      <ResultsContextProvider key={padId} value={results}>
        <Box pb="70px" w="100vw" pos="relative">
          <Container maxW="75ch">
            <DropFile editor={editor}>
              <Slate editor={editor} value={value} onChange={onChange}>
                {editablePlugins}
                <DashCommandsPortal
                  target={target}
                  index={index}
                  values={values}
                  onClick={onAddElement}
                />
                <MentionPortal
                  target={mentionTarget}
                  index={mentionIndex}
                  users={filteredUsers}
                />
                <HoveringToolbar />
              </Slate>
            </DropFile>
          </Container>
          <Button
            pos="absolute"
            onClick={() => {
              editor.insertNode({ type: 'code_block', text: '' });
              Transforms.setNodes(editor, { type: 'code_block' });
              ReactEditor.focus(editor);
            }}
            top={0}
            right={10}
            leftIcon={<Icon as={FiPlus} />}
          >
            Add Model Block
          </Button>
        </Box>
      </ResultsContextProvider>
    );
  }
};

export * from './Contexts/Runtime';
