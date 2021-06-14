import { Box } from '@chakra-ui/react';
import { Blocks, Leaves } from '@decipad/ui';
import { EditablePlugins } from '@udecode/slate-plugins';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useState } from 'react';
import { Editor, Node } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
} from 'slate-react';
import { useEditor } from './Hooks/useEditor';
import { plugins } from './Plugins';
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
  workspaceId: string;
  padId: string;
}

export const DeciEditor = ({
  workspaceId,
  padId,
}: DeciEditorProps): JSX.Element => {
  const [value, setValue] = useState<Node[] | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const { loading: _, onChange: onChangeResult } = useEditor({
    workspaceId,
    padId,
    setValue,
    setEditor,
  });
  const renderElement = useCallback(
    (props: RenderElementProps) => <Blocks {...props} />,
    []
  );

  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaves {...props} />,
    []
  );

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

  useEffect(() => {
    if (editor !== null) {
      ReactEditor.focus(editor as any);
    }
  }, [editor]);

  if (editor === null || value === null) {
    return <span>Loading...</span>;
  }

  const onChange = (newValue: Node[]) => {
    onChangeDashCommands(editor);
    onChangeMention(editor);
    onChangeResult(editor);
    setValue(newValue);
  };

  return (
    <Box>
      <Slate editor={editor as any} value={value} onChange={onChange}>
        <EditablePlugins
          autoFocus={true}
          style={{ height: '100%' }}
          plugins={plugins}
          renderElement={[renderElement]}
          renderLeaf={[renderLeaf]}
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
    </Box>
  );
};

export * from './Contexts/Runtime';
