import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useCallback, useEffect, useState } from 'react';
import { InlineMenuItem } from '../../atoms';
import { InlineMenuGroup } from '../../molecules';
import {
  cssVar,
  offBlack,
  p14Regular,
  setCssVar,
  transparency,
} from '../../primitives';

const styles = css({
  maxWidth: '80vw',
  maxHeight: '33vh',
  overflowX: 'hidden',
  overflowY: 'scroll',
  display: 'grid',
  gridTemplateColumns: 'fit-content(75vw)',
  padding: '12px',

  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '8px',
  boxShadow: `0px 2px 24px -4px ${transparency(offBlack, 0.08).rgba}`,

  ':empty::before': {
    ...p14Regular,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    content: '"No matching items found"',
  },
});

type InlineMenuCommand = string;

type MenuCommandGroup = Omit<
  ComponentProps<typeof InlineMenuGroup>,
  'children'
> & {
  readonly items: ReadonlyArray<MenuCommandItem>;
};
type MenuCommandItem = Omit<
  ComponentProps<typeof InlineMenuItem>,
  'focused' | 'onExecute'
> & {
  readonly command: InlineMenuCommand;
  readonly extraSearchTerms: ReadonlyArray<string>;
};

interface InlineMenuProps {
  readonly onExecute?: (command: InlineMenuCommand) => void;
  readonly groups: Array<MenuCommandGroup>;
  readonly search?: string;
}
export const InlineMenu: FC<InlineMenuProps> = ({
  groups,
  onExecute = noop,
  search = '',
}) => {
  const groupsWithItemsFiltered = groups.map(({ items, ...group }) => {
    const matchingItems = items.filter(({ command, title, extraSearchTerms }) =>
      [command, title, ...extraSearchTerms].some((term) =>
        term.toLowerCase().includes(search.toLowerCase())
      )
    );
    return { ...group, matchingItems };
  });
  const matchingCommands = groupsWithItemsFiltered
    .flatMap(({ matchingItems }) => matchingItems)
    .map(({ command }) => command);

  // SlashCommandsMenuItems do not use real browser focus, see their docs
  const [focusedCommand, setFocusedCommand] = useState<InlineMenuCommand>();

  const firstMatch = matchingCommands[0];
  useEffect(() => {
    setFocusedCommand(firstMatch);
  }, [firstMatch]);

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
        case event.key === 'Enter' && focusedCommand === undefined:
          setFocusedCommand(matchingCommands[0]);
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
          <InlineMenuGroup key={i} {...group}>
            {matchingItems.map(({ command, extraSearchTerms, ...item }) => (
              <InlineMenuItem
                {...item}
                data-testid={`menu-item-${command}`}
                key={command}
                focused={focusedCommand === command}
                onExecute={() => onExecute(command)}
              />
            ))}
          </InlineMenuGroup>
        ) : null
      )}
    </div>
  );
};
