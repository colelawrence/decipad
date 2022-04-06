import { isEnabled } from '@decipad/feature-flags';
import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useCallback, useEffect, useState } from 'react';
import { noop } from '@decipad/utils';
import { SlashCommandsMenuItem } from '../../atoms';
import { Heading, Input, Pie, Shapes, Table } from '../../icons';
import { SlashCommandsMenuGroup } from '../../molecules';
import {
  black,
  cssVar,
  p14Regular,
  setCssVar,
  transparency,
} from '../../primitives';

const SLASH_COMMANDS = [
  'calculation-block',
  'input',
  'table',
  'plot',
  'heading1',
  'heading2',
  'import',
] as const;
type SlashCommand = typeof SLASH_COMMANDS[number];

type SlashCommandGroup = Omit<
  ComponentProps<typeof SlashCommandsMenuGroup>,
  'children'
> & {
  readonly items: ReadonlyArray<SlashCommandItem>;
};
type SlashCommandItem = Omit<
  ComponentProps<typeof SlashCommandsMenuItem>,
  'focused' | 'onExecute'
> & {
  readonly command: SlashCommand;
  readonly extraSearchTerms: ReadonlyArray<string>;
};

const dataItems = [
  {
    command: 'calculation-block',
    title: 'Calculations',
    description: 'Play with your data, add inputs and see results',
    icon: <Shapes />,
    extraSearchTerms: [
      'deci language',
      'calculation block',
      'language block',
      'model block',
    ],
  },
  {
    command: 'table',
    title: 'Table',
    description: 'Input your data in a table',
    icon: <Table />,
    extraSearchTerms: [],
  },
];

// plots are hidden in prod
if (isEnabled('PLOT_ELEMENTS')) {
  dataItems.push({
    command: 'plot',
    title: 'Plot',
    description: 'Plot your data in a graph',
    icon: <Pie />,
    extraSearchTerms: [],
  });
}

const groups: ReadonlyArray<SlashCommandGroup> = [
  {
    title: 'Interactivity',
    items: [
      {
        command: 'input',
        title: 'Number Field',
        description: 'Add an input users can interact with',
        icon: <Input />,
        extraSearchTerms: [],
      },
    ],
  },
  {
    title: 'Data',
    items: dataItems as SlashCommandGroup['items'],
  },
  {
    title: 'Text',
    items: [
      {
        command: 'heading1',
        title: 'Heading',
        description: 'Add main text heading',
        icon: <Heading />,
        extraSearchTerms: [],
      },
      {
        command: 'heading2',
        title: 'Sub-heading',
        description: 'Add secondary text heading',
        icon: <Heading />,
        extraSearchTerms: [],
      },
    ],
  },
];

const styles = css({
  width: 'max-content',
  display: 'grid',
  gridTemplateColumns: 'fit-content(75vw)',
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
  boxShadow: `0px 2px 24px -4px ${transparency(black, 0.08).rgba}`,

  ':empty::before': {
    ...p14Regular,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    content: '"No matching items found"',
  },
});

interface SlashCommandsMenuProps {
  readonly onExecute?: (command: SlashCommand) => void;

  readonly search?: string;
}
export const SlashCommandsMenu = ({
  onExecute = noop,
  search = '',
}: SlashCommandsMenuProps): ReturnType<FC> => {
  const groupsWithItemsFiltered = groups.map(({ items, ...group }) => {
    const groupMatchesSearch = group.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchingItems = groupMatchesSearch
      ? items
      : items.filter(({ command, title, description, extraSearchTerms }) =>
          [command, title, description, ...extraSearchTerms].some((term) =>
            term.toLowerCase().includes(search.toLowerCase())
          )
        );
    return { ...group, matchingItems };
  });
  const matchingCommands = groupsWithItemsFiltered
    .flatMap(({ matchingItems }) => matchingItems)
    .map(({ command }) => command);

  // SlashCommandsMenuItems do not use real browser focus, see their docs
  const [focusedCommand, setFocusedCommand] = useState<SlashCommand>();
  useEffect(() => {
    setFocusedCommand(undefined);
  }, [search]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (true) {
        case event.key === 'ArrowDown' && !event.shiftKey:
        case event.key === 'Tab' && !event.shiftKey:
          setFocusedCommand(
            matchingCommands[
              (focusedCommand ? matchingCommands.indexOf(focusedCommand) : -1) +
                1
            ] ?? matchingCommands[0]
          );
          event.stopPropagation();
          event.preventDefault();
          break;
        case event.key === 'ArrowUp' && !event.shiftKey:
        case event.key === 'Tab' && event.shiftKey:
          setFocusedCommand(
            matchingCommands[
              (focusedCommand
                ? matchingCommands.indexOf(focusedCommand)
                : matchingCommands.length) - 1
            ] ?? matchingCommands.slice(-1)[0]
          );
          event.stopPropagation();
          event.preventDefault();
          break;
      }
    },
    [focusedCommand, matchingCommands]
  );
  useWindowListener('keydown', onKeyDown, true);

  return (
    <div role="menu" aria-orientation="vertical" css={styles}>
      {groupsWithItemsFiltered.map(({ matchingItems, ...group }, i) =>
        matchingItems.length ? (
          <SlashCommandsMenuGroup key={i} {...group}>
            {matchingItems.map(({ command, extraSearchTerms, ...item }) => (
              <SlashCommandsMenuItem
                {...item}
                key={command}
                focused={focusedCommand === command}
                onExecute={() => onExecute(command)}
              />
            ))}
          </SlashCommandsMenuGroup>
        ) : null
      )}
    </div>
  );
};
