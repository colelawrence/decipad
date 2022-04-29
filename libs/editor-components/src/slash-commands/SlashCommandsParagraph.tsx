/* eslint-disable react-hooks/rules-of-hooks */
import { useWindowListener } from '@decipad/react-utils';
import { ClientEventsContext } from '@decipad/client-events';
import { useEditorState } from '@udecode/plate';
import { organisms } from '@decipad/ui';
import { PlateComponent } from '@decipad/editor-types';
import { Paragraph } from '@decipad/editor-components';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Node } from 'slate';
import { useFocused, useSelected } from 'slate-react';
import { css } from '@emotion/react';
import { Computer } from '@decipad/language';
import { findPath } from '@decipad/editor-utils';
import { execute } from '../utils/slashCommands';

const slashCommandWrapperStyles = css({
  position: 'absolute',
  zIndex: 1,
  // To prevent blurring the editor when clicking around in the menu
  userSelect: 'none',
});

export const SlashCommandsParagraph =
  (computer: Computer): PlateComponent =>
  (props) => {
    if (!props.element) {
      throw new Error('SlashCommandsParagraph is not a leaf');
    }

    const editor = useEditorState();
    const selected = useSelected();
    const focused = useFocused();
    const clientEvent = useContext(ClientEventsContext);

    const elementPath = findPath(editor, props.element);
    const text = Node.string(props.element);

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

    // offset management
    const paragraphRef = useRef<HTMLParagraphElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      menuRef.current?.scrollIntoView({ block: 'nearest' });
    }, [showSlashCommands, search]);

    const [leftOffset, setLeftOffset] = useState('400px');
    const [topOffset, setTopOffset] = useState('400px');
    const paragraphXOffset = paragraphRef.current?.getBoundingClientRect().x;
    useEffect(() => {
      const xOffset = `${
        Math.round(paragraphRef.current?.getBoundingClientRect().x || 30) - 30
      }px`;
      if (xOffset !== leftOffset) {
        setLeftOffset(xOffset);
      }
      const yOffset = `${
        Math.round(paragraphRef.current?.getBoundingClientRect().y || 400) - 100
      }px`;
      if (yOffset !== topOffset) {
        setTopOffset(yOffset);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      leftOffset,
      topOffset,
      paragraphRef.current,
      paragraphXOffset,
      showSlashCommands,
    ]);

    // key management
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

    if (!elementPath) {
      return <></>;
    }

    if (showSlashCommands) {
      return (
        <>
          <div>
            <Paragraph {...props} paragraphRef={paragraphRef} />
          </div>
          <div>
            <div
              ref={menuRef}
              contentEditable={false}
              css={[
                slashCommandWrapperStyles,
                {
                  top: topOffset,
                  left: leftOffset,
                },
              ]}
            >
              <organisms.SlashCommandsMenu
                onExecute={(command) => {
                  execute({
                    editor,
                    path: elementPath,
                    command,
                    getAvailableIdentifier:
                      computer.getAvailableIdentifier.bind(computer),
                  });
                  clientEvent({
                    type: 'action',
                    action: 'slash command',
                    props: { command },
                  });
                }}
                search={search}
              />
            </div>
          </div>
        </>
      );
    }

    return <Paragraph {...props} />;
  };
