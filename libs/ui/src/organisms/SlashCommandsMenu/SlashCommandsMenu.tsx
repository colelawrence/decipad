import { isEnabled } from '@decipad/feature-flags';
import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useCallback, useEffect, useState } from 'react';
import { noop } from '@decipad/utils';
import { SlashCommandsMenuItem } from '../../atoms';
import {
  Input,
  Slider,
  TableSlash,
  Calculations,
  Chart,
  DatePicker,
  Heading1,
  Heading2,
  Divider,
  Callout,
  Blockquote,
} from '../../icons';
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
  'slider',
  'datepicker',
  'divider',
  'callout',
  'blockquote',
  'divider',
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
    description: 'Use formulas to derive insight',
    icon: <Calculations />,
    enabled: true,
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
    description: 'Empty table to structure your data',
    icon: <TableSlash />,
    enabled: true,
    extraSearchTerms: [],
  },
  {
    command: 'plot',
    title: 'Chart',
    description: 'Chart some of your data',
    icon: <Chart />,
    enabled: isEnabled('PLOT_ELEMENTS'),
    extraSearchTerms: [],
  },
];

const groups: ReadonlyArray<SlashCommandGroup> = [
  {
    title: 'Numbers',
    items: dataItems as SlashCommandGroup['items'],
  },
  {
    title: 'Widgets',
    items: [
      {
        command: 'input',
        title: 'Input',
        description: 'Share your notebook and have others interact with it',
        icon: <Input />,
        enabled: true,
        extraSearchTerms: ['input', 'number', 'publish'],
      },
      {
        command: 'datepicker',
        title: 'Date',
        description: 'Interact with your notebook using dates',
        icon: <DatePicker />,
        enabled: false,
        extraSearchTerms: ['input', 'date', 'calendar', 'publish'],
      },
      {
        command: 'slider',
        title: 'Slider',
        description: 'Let users interact with your notebook with a slider',
        icon: <Slider />,
        enabled: false,
        extraSearchTerms: ['input', 'number', 'slider', 'publish'],
      },
    ],
  },
  {
    title: 'Text',
    items: [
      {
        command: 'heading1',
        title: 'Heading',
        description: 'Add main text heading',
        icon: <Heading1 />,
        enabled: true,
        extraSearchTerms: ['h1'],
      },
      {
        command: 'heading2',
        title: 'Sub-heading',
        description: 'Add secondary text heading',
        icon: <Heading2 />,
        enabled: true,
        extraSearchTerms: ['h2'],
      },
      {
        command: 'callout',
        title: 'Callout',
        description: 'Grabs the readers attention',
        icon: <Callout />,
        enabled: true,
        extraSearchTerms: ['highlight', 'pop', 'hero'],
      },
      {
        command: 'blockquote',
        title: 'Quote',
        description: 'Quote something, or someone.',
        icon: <Blockquote />,
        enabled: true,
        extraSearchTerms: ['>', 'quote', 'blockquote'],
      },
      {
        command: 'divider',
        title: 'Divider',
        description: 'A separator between your text',
        icon: <Divider />,
        enabled: true,
        extraSearchTerms: ['hr', 'divider', '-'],
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
