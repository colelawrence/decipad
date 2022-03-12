/* eslint-disable react-hooks/rules-of-hooks */
import { organisms } from '@decipad/ui';
import { useWindowListener } from '@decipad/react-utils';
import { ClientEventsContext } from '@decipad/client-events';
import { useEditorState } from '@udecode/plate';
import { useCallback, useEffect, useState, useContext, useRef } from 'react';
import { Editor } from 'slate';
import { ReactEditor, useFocused, useSelected } from 'slate-react';
import { PlateComponent } from '../../types';
import { execute } from '../../utils/slashCommands';
import { Paragraph } from '../text';

export const SlashCommandsParagraph: PlateComponent = (props) => {
  if (!props.element) {
    throw new Error('SlashCommandsParagraph is not a leaf');
  }

  const editor = useEditorState();
  const selected = useSelected();
  const focused = useFocused();
  const clientEvent = useContext(ClientEventsContext);

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

  const search = /^\/([a-z ]*)$/i.exec(text)?.[1];
  const showSlashCommands =
    selected && focused && !menuSuppressed && search !== undefined;

  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    menuRef.current?.scrollIntoView({ block: 'nearest' });
  }, [showSlashCommands, search]);

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
          ref={menuRef}
          contentEditable={false}
          css={{
            position: 'absolute',
            zIndex: 1,
            // To prevent blurring the editor when clicking around in the menu
            userSelect: 'none',
          }}
        >
          <organisms.SlashCommandsMenu
            onExecute={(command) => {
              execute(editor, elementPath, command);
              clientEvent({
                type: 'action',
                action: 'slash command',
                props: { command },
              });
            }}
            search={search}
          />
        </div>
      </>
    );
  }

  return <Paragraph {...props} />;
};
