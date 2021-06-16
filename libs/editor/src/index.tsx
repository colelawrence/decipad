import { pipe } from '@udecode/slate-plugins';
import { Box } from '@chakra-ui/react';
import { Blocks, Leaves } from '@decipad/ui';
import { EditablePlugins } from '@udecode/slate-plugins';
import dynamic from 'next/dynamic';
import React, { useCallback, useState, useMemo } from 'react';
import { Node, createEditor } from 'slate';
import { ReactEditor, Slate } from 'slate-react';
import { useEditor } from './Hooks/useEditor';
import { plugins } from './Plugins';
import { commands } from './Plugins/DashCommands/commands';
import { DashCommandsPortalProps } from './Plugins/DashCommands/DashCommandsPortal';
import { useDashCommands } from './Plugins/DashCommands/useDashCommands';
import { HoveringToolbar } from './Plugins/HoveringToolbar/HoveringToolbar.component';
import { MentionPortalProps } from './Plugins/MentionPlugin/MentionPortal.component';
import { useMention } from './Plugins/MentionPlugin/useMention';
import { users } from './Plugins/MentionPlugin/users';
import { withPlugins } from './Plugins';

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
  workspaceId: string;
  padId: string;
}

export const DeciEditor = ({ padId }: DeciEditorProps): JSX.Element => {
  const [value, setValue] = useState<Node[] | null>(null);
  const editor = useState(
    (): ReactEditor => pipe(createEditor(), ...withPlugins)
  )[0];
  const { onChangeLanguage } = useEditor({ padId, editor, setValue });

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
        renderElement={[(props) => <Blocks {...props} />]}
        renderLeaf={[(props) => <Leaves {...props} />]}
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

  if (value == null) {
    return <span>Loading...</span>;
  }

  return (
    <Box>
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
    </Box>
  );
};

export * from './Contexts/Runtime';
