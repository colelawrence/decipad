import { css } from '@emotion/react';
import { Content, Root, Trigger } from '@radix-ui/react-dropdown-menu';
import { FC } from 'react';
import { SlashCommandsMenuItem } from '../../atoms';
import { Shapes, Table, Text } from '../../icons';
import { SlashCommandsMenuGroup } from '../../molecules';
import { black, cssVar, transparency } from '../../primitives';
import { noop } from '../../utils';

const styles = css({
  maxWidth: '75vw',
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
  boxShadow: `0px 2px 24px -4px ${transparency(black, 0.08).rgba}`,
});

type SlashCommand =
  | 'calculation-block'
  | 'table'
  | 'heading1'
  | 'heading2'
  | 'import-data';

interface SlashCommandsMenuProps {
  readonly onExecute?: (command: SlashCommand) => void;
}
export const SlashCommandsMenu = ({
  onExecute = noop,
}: SlashCommandsMenuProps): ReturnType<FC> => {
  return (
    <Root open>
      <Trigger css={{ height: 0 }}>&nbsp;</Trigger>
      <Content css={styles}>
        <SlashCommandsMenuGroup title="Modeling">
          <SlashCommandsMenuItem
            title="Calculations"
            description="Calculation block that uses Deci language"
            icon={<Shapes />}
            onSelect={() => onExecute('calculation-block')}
          />
          <SlashCommandsMenuItem
            title="Table"
            description="Empty table to structure your data"
            icon={<Table />}
            onSelect={() => onExecute('table')}
          />
        </SlashCommandsMenuGroup>
        <SlashCommandsMenuGroup title="Text">
          <SlashCommandsMenuItem
            title="Heading 1"
            description="Main text heading"
            icon={<Text />}
            onSelect={() => onExecute('heading1')}
          />
          <SlashCommandsMenuItem
            title="Heading 2"
            description="Secondary text heading"
            icon={<Text />}
            onSelect={() => onExecute('heading2')}
          />
        </SlashCommandsMenuGroup>
        <SlashCommandsMenuGroup title="Import">
          <SlashCommandsMenuItem
            title="Import data"
            description="Import a CSV file or data from a gSheets spreadsheet"
            icon={<Table />}
            onSelect={() => onExecute('import-data')}
          />
        </SlashCommandsMenuGroup>
      </Content>
    </Root>
  );
};
