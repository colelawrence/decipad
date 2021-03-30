import { Box } from '@chakra-ui/react';
import { EditablePlugins, pipe } from '@udecode/slate-plugins';
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
import { useRuntime } from './hooks/useRuntime';
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

const actorId = nanoid();

interface DeciEditorProps {
  docId: string;
}

export const DeciEditor = ({ docId }: DeciEditorProps): JSX.Element => {
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  const [value, setValue] = useState<Node[]>([
    {
      children: [{ children: [{ text: '' }] }],
    },
  ]);

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

  const { context, onChangeResult } = useRuntime({ docId });

  const onChange = (newValue: Node[]) => {
    onChangeDashCommands(editor);
    onChangeMention(editor);
    onChangeResult(editor);
    const ops = editor.operations;
    if (ops && ops.length) {
      context.sendSlateOperations(ops);
    }
    setValue(newValue);
  };

  useEffect(() => {
    const cancel = context.subscribe({
      initialContext: (context) => {
        setValue(context.children);
      },
      error: (err: Error) => {
        throw Object.assign(new Error(), err);
      },
    });

    context.start();

    return () => cancel();
  }, [editor, context]);

  useEffect(() => {
    ReactEditor.focus(editor);
  }, [editor]);

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
