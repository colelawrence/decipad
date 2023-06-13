import { useContext } from 'react';
/* eslint-disable react-hooks/rules-of-hooks */
import { ClientEventsContext } from '@decipad/client-events';
import { ImportFromLinkMenu, SlashCommandsMenu } from '@decipad/ui';
import {
  ELEMENT_PARAGRAPH,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { Paragraph } from '@decipad/editor-components';
import { Computer } from '@decipad/computer';

import { assertElementType } from '@decipad/editor-utils';
import { execute } from '../utils/slashCommands';
import { useSlashMenu } from './useSlashMenu';
import { useInteractiveMenu } from './useInteractiveMenu';

export const InteractiveParagraph =
  (computer: Computer): PlateComponent =>
  ({ children, ...props }) => {
    const paragraphElement = props.element;
    assertElementType(paragraphElement, ELEMENT_PARAGRAPH);

    const editor = useTEditorRef();
    const clientEvent = useContext(ClientEventsContext);

    // slash commands menu
    const { showSlashCommands, menuRef, elementPath, deleteFragment, search } =
      useSlashMenu(paragraphElement);

    // interactions
    const { showInteractionMenu, onInteractionMenuExecute, source } =
      useInteractiveMenu(paragraphElement);

    if (showSlashCommands && !showInteractionMenu) {
      return (
        <Paragraph {...props}>
          {children}
          <div
            ref={menuRef}
            contentEditable={false}
            css={{
              position: 'absolute',
              zIndex: 2,
              // To prevent blurring the editor when clicking around in the menu
              userSelect: 'none',
            }}
          >
            <SlashCommandsMenu
              onExecute={(command) => {
                elementPath &&
                  execute({
                    editor,
                    path: elementPath.slice(0, 1),
                    deleteFragment,
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
        </Paragraph>
      );
    }

    return (
      <Paragraph {...props}>
        <>
          {children}
          {showInteractionMenu && (
            <div
              ref={menuRef}
              contentEditable={false}
              css={{
                position: 'absolute',
                zIndex: 2,
                // To prevent blurring the editor when clicking around in the menu
                userSelect: 'none',
              }}
            >
              <ImportFromLinkMenu
                source={source}
                onExecute={onInteractionMenuExecute}
              />
            </div>
          )}
        </>
      </Paragraph>
    );
  };
