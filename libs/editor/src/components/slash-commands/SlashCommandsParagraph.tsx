import { organisms } from '@decipad/ui';
import { useWindowListener } from '@decipad/react-utils';
import { PlatePluginComponent, useEditorState } from '@udecode/plate';
import { useCallback, useEffect, useState } from 'react';
import { Editor } from 'slate';
import { ReactEditor, useFocused, useSelected } from 'slate-react';
import { execute } from '../../utils/slashCommands';
import { Paragraph } from '../text';

export const SlashCommandsParagraph: PlatePluginComponent = (props) => {
  const editor = useEditorState();
  const selected = useSelected();
  const focused = useFocused();

  const elementPath = ReactEditor.findPath(editor, props.element);
  const text = Editor.string(editor, elementPath);

  const [menuSuppressed, setMenuSuppressed] = useState(true);
  // Show when changing text
  useEffect(() => {
    if (selected) {
      setMenuSuppressed(false);
    }
    // intentionally only run when text changes while selected,
    // but not when only selection changes from false to true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  // Suppress when selection moves out
  useEffect(() => {
    if (!selected) {
      setMenuSuppressed(true);
    }
  }, [selected]);

  const showSlashCommands =
    selected && focused && !menuSuppressed && /^\/[a-z]*$/i.test(text);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showSlashCommands && !event.shiftKey) {
        switch (event.key) {
          case 'Escape':
            setMenuSuppressed(true);
            event.stopPropagation();
            event.preventDefault();
            break;
        }
      }
    },
    [showSlashCommands]
  );
  useWindowListener('keydown', onKeyDown, true);

  if (showSlashCommands) {
    return (
      <>
        <Paragraph {...props} />
        <div
          contentEditable={false}
          css={{
            position: 'absolute',
            zIndex: 1,
            // To prevent blurring the editor when clicking around in the menu
            userSelect: 'none',
          }}
        >
          <organisms.SlashCommandsMenu
            onExecute={(cmd) => execute(editor, elementPath, cmd)}
          />
        </div>
      </>
    );
  }

  return <Paragraph {...props} />;
};
