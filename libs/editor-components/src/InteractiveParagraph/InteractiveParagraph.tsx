/* eslint-disable react-hooks/rules-of-hooks */
import type { PlateComponent, SlashCommand } from '@decipad/editor-types';
import { ELEMENT_PARAGRAPH, useMyEditorRef } from '@decipad/editor-types';
import { SlashCommandsMenu } from '@decipad/ui';

import { assertElementType } from '@decipad/editor-utils';
import { useThemeFromStore } from '@decipad/react-contexts';
import { execute } from '../utils/slashCommands';
import { useSlashMenu } from './useSlashMenu';
import { Paragraph } from '../text/Paragraph';
import styled from '@emotion/styled';
import { useComputer } from '@decipad/editor-hooks';
import { analytics } from '@decipad/client-events';

export const InteractiveParagraph: PlateComponent = ({
  children,
  ...props
}) => {
  const paragraphElement = props.element;
  assertElementType(paragraphElement, ELEMENT_PARAGRAPH);

  const editor = useMyEditorRef();
  const computer = useComputer();
  const [isDarkTheme] = useThemeFromStore();

  // slash commands menu
  const { showSlashCommands, menuRef, elementPath, deleteFragment, search } =
    useSlashMenu(paragraphElement);

  if (!showSlashCommands) {
    return <Paragraph {...props}>{children}</Paragraph>;
  }

  return (
    <Paragraph {...props}>
      {children}
      <SlashCommandsWrapper ref={menuRef} contentEditable={false}>
        <SlashCommandsMenu
          colorize={isDarkTheme}
          onExecute={(command) => {
            elementPath &&
              execute({
                editor,
                computer,
                path: elementPath,
                deleteFragment,
                command: command as SlashCommand,
                getAvailableIdentifier:
                  computer.getAvailableIdentifier.bind(computer),
              });
            analytics.track({
              type: 'action',
              action: 'slash command',
              props: { command },
            });
          }}
          search={search}
        />
      </SlashCommandsWrapper>
    </Paragraph>
  );
};

const SlashCommandsWrapper = styled.div({
  position: 'absolute',
  zIndex: 2,
  // To prevent blurring the editor when clicking around in the menu
  userSelect: 'none',
});
