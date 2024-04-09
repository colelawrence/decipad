import { useContext } from 'react';
/* eslint-disable react-hooks/rules-of-hooks */
import { ClientEventsContext } from '@decipad/client-events';
import type { RemoteComputer } from '@decipad/remote-computer';
import { Paragraph } from '@decipad/editor-components';
import type { PlateComponent, SlashCommand } from '@decipad/editor-types';
import { ELEMENT_PARAGRAPH, useMyEditorRef } from '@decipad/editor-types';
import { ImportFromLinkMenu, SlashCommandsMenu } from '@decipad/ui';

import { assertElementType } from '@decipad/editor-utils';
import { useThemeFromStore } from '@decipad/react-contexts';
import { execute } from '../utils/slashCommands';
import { useInteractiveMenu } from './useInteractiveMenu';
import { useSlashMenu } from './useSlashMenu';

export const InteractiveParagraph =
  (computer: RemoteComputer): PlateComponent =>
  ({ children, ...props }) => {
    const paragraphElement = props.element;
    assertElementType(paragraphElement, ELEMENT_PARAGRAPH);

    const editor = useMyEditorRef();
    const clientEvent = useContext(ClientEventsContext);
    const [isDarkTheme] = useThemeFromStore();

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
              colorize={!!isDarkTheme}
              onExecute={(command) => {
                elementPath &&
                  execute({
                    editor,
                    computer,
                    path: elementPath.slice(0, 1),
                    deleteFragment,
                    command: command as SlashCommand,
                    getAvailableIdentifier:
                      computer.getAvailableIdentifier.bind(computer),
                  });
                clientEvent({
                  segmentEvent: {
                    type: 'action',
                    action: 'slash command',
                    props: { command },
                  },
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
