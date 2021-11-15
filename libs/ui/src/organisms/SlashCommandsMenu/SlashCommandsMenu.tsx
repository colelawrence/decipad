import { css } from '@emotion/react';
import { FC, useEffect, useState } from 'react';
import { SlashCommandsMenuItem } from '../../atoms';
import { Shapes, Table, Text } from '../../icons';
import { SlashCommandsMenuGroup } from '../../molecules';
import { black, cssVar, transparency } from '../../primitives';
import { noop } from '../../utils';

const styles = css({
  width: 'max-content',
  display: 'grid',
  gridTemplateColumns: 'fit-content(75vw)',
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
  boxShadow: `0px 2px 24px -4px ${transparency(black, 0.08).rgba}`,
});

const SLASH_COMMANDS = [
  'calculation-block',
  'table',
  'heading1',
  'heading2',
  'import-data',
] as const;
type SlashCommand = typeof SLASH_COMMANDS[number];

interface SlashCommandsMenuProps {
  readonly onExecute?: (command: SlashCommand) => void;
}
export const SlashCommandsMenu = ({
  onExecute = noop,
}: SlashCommandsMenuProps): ReturnType<FC> => {
  // SlashCommandsMenuItems do not use real browser focus, see their docs
  const [focusedCommand, setFocusedCommand] = useState<SlashCommand>();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey) {
        switch (event.key) {
          case 'ArrowDown':
            setFocusedCommand(
              SLASH_COMMANDS[
                (focusedCommand ? SLASH_COMMANDS.indexOf(focusedCommand) : -1) +
                  1
              ] ?? SLASH_COMMANDS[0]
            );
            event.stopPropagation();
            event.preventDefault();
            break;
          case 'ArrowUp':
            setFocusedCommand(
              SLASH_COMMANDS[
                (focusedCommand
                  ? SLASH_COMMANDS.indexOf(focusedCommand)
                  : SLASH_COMMANDS.length) - 1
              ] ?? SLASH_COMMANDS.slice(-1)[0]
            );
            event.stopPropagation();
            event.preventDefault();
            break;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [focusedCommand, onExecute]);

  return (
    <div role="menu" aria-orientation="vertical" css={styles}>
      <SlashCommandsMenuGroup title="Modeling">
        <SlashCommandsMenuItem
          title="Calculations"
          description="Calculation block that uses Deci language"
          icon={<Shapes />}
          focused={focusedCommand === 'calculation-block'}
          onExecute={() => onExecute('calculation-block')}
        />
        <SlashCommandsMenuItem
          title="Table"
          description="Empty table to structure your data"
          icon={<Table />}
          focused={focusedCommand === 'table'}
          onExecute={() => onExecute('table')}
        />
      </SlashCommandsMenuGroup>
      <SlashCommandsMenuGroup title="Text">
        <SlashCommandsMenuItem
          title="Heading 1"
          description="Main text heading"
          icon={<Text />}
          focused={focusedCommand === 'heading1'}
          onExecute={() => onExecute('heading1')}
        />
        <SlashCommandsMenuItem
          title="Heading 2"
          description="Secondary text heading"
          icon={<Text />}
          focused={focusedCommand === 'heading2'}
          onExecute={() => onExecute('heading2')}
        />
      </SlashCommandsMenuGroup>
      <SlashCommandsMenuGroup title="Import">
        <SlashCommandsMenuItem
          title="Import data"
          description="Import a CSV file or data from a gSheets spreadsheet"
          icon={<Table />}
          focused={focusedCommand === 'import-data'}
          onExecute={() => onExecute('import-data')}
        />
      </SlashCommandsMenuGroup>
    </div>
  );
};
