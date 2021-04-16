import { Box } from '@chakra-ui/react';
import { EditablePlugins } from '@udecode/slate-plugins';
import { nanoid } from 'nanoid';
import dynamic from 'next/dynamic';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Node } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
} from 'slate-react';
import { Elements } from './Elements';
import { useEditor } from './hooks/useEditor';
import { Leaves } from './Leaves';
import { plugins, withPlugins } from './plugins';
import { commands } from './plugins/DashCommands/commands';
import { DashCommandsPortalProps } from './plugins/DashCommands/DashCommandsPortal';
import { useDashCommands } from './plugins/DashCommands/useDashCommands';
import { HoveringToolbar } from './plugins/HoveringToolbar/HoveringToolbar.component';
import { MentionPortalProps } from './plugins/MentionPlugin/MentionPortal.component';
import { useMention } from './plugins/MentionPlugin/useMention';
import { users } from './plugins/MentionPlugin/users';

const DashCommandsPortal = dynamic<DashCommandsPortalProps>(
  () =>
    import('./plugins/DashCommands/DashCommandsPortal').then(
      (res) => res.DashCommandsPortal
    ),
  { ssr: false }
);

const MentionPortal = dynamic<MentionPortalProps>(
  () =>
    import('./plugins/MentionPlugin/MentionPortal.component').then(
      (res) => res.MentionPortal
    ),
  { ssr: false }
);

interface DeciEditorProps {
  workspaceId: string;
  padId: string;
}

export const DeciEditor = ({ workspaceId, padId }: DeciEditorProps): JSX.Element => {
  const [value, setValue] = useState(null)
  const { loading, editor, onChange: onChangeResult } = useEditor({ workspaceId, padId, withPlugins, setValue })
  const renderElement = useCallback(
    (props: RenderElementProps) => <Elements {...props} />,
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
      ReactEditor.focus(editor);
    }
  }, [editor]);

  if (editor === null) {
    return <span>Loading...</span>
  }

  const onChange = (newValue: Node[]) => {
    onChangeDashCommands(editor);
    onChangeMention(editor);
    onChangeResult(newValue);
    setValue(newValue)
  };

  return (
    <Box>
      <Slate editor={editor} value={value} onChange={onChange}>
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
