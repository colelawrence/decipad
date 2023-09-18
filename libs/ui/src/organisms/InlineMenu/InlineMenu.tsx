import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useCallback, useEffect, useState } from 'react';
import { InlineMenuItem } from '../../atoms';
import { InlineMenuGroup } from '../../molecules';
import { cssVar, mediumShadow, p14Regular } from '../../primitives';
import { deciOverflowYStyles } from '../../styles/scrollbars';

const styles = css(
  {
    maxWidth: '80vw',
    maxHeight: '50vh',
    overflowX: 'hidden',
    display: 'grid',
    gridTemplateColumns: 'fit-content(75vw)',
    padding: '12px',
    rowGap: '12px',
    backgroundColor: cssVar('backgroundMain'),
    border: `1px solid ${cssVar('borderSubdued')}`,
    borderRadius: '8px',
    boxShadow: `0px 2px 24px -4px ${mediumShadow.rgba}`,

    ':empty::before': {
      ...p14Regular,

      content: '"No matching items found"',
    },
  },
  deciOverflowYStyles
);

const inlineStyles = css(
  {
    maxHeight: 'unset',
    backgroundColor: 'transparent',
    boxShadow: 'unset',
    border: 'unset',
    overflowX: 'hidden',
  },
  deciOverflowYStyles
);

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
  readonly variant?: 'block' | 'inline';
}
export const InlineMenu: FC<InlineMenuProps> = ({
  groups,
  onExecute = noop,
  search = '',
  variant = 'block',
}) => {
  const groupsWithItemsFiltered = groups.map(({ items, ...group }) => {
    const matchingItems = items.filter(({ command, title, extraSearchTerms }) =>
      [command, title, ...extraSearchTerms].some((term) => {
        const { title: groupTitle } = group;
        return search === ''
          ? term.toLowerCase().includes(search.toLowerCase())
          : groupTitle &&
              !groupTitle.includes('Most') &&
              term.toLowerCase().includes(search.toLowerCase());
      })
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
    variant === 'block' && setFocusedCommand(firstMatch);
  }, [firstMatch, variant]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (variant !== 'block') {
        return;
      }
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
    [focusedCommand, matchingCommands, variant]
  );
  useWindowListener('keydown', onKeyDown, true);

  let foundFocusedItem = false;

  const slashContainerStyles = [styles, variant === 'inline' && inlineStyles];

  return (
    <div role="menu" aria-orientation="vertical" css={slashContainerStyles}>
      {groupsWithItemsFiltered.map(({ matchingItems, ...group }, i) => {
        return matchingItems.length ? (
          <InlineMenuGroup key={i} {...group}>
            {matchingItems.map(({ command, ...item }) => {
              const setFocus =
                variant === 'block' &&
                focusedCommand === command &&
                !foundFocusedItem;
              const focusedItem = (
                <InlineMenuItem
                  {...item}
                  data-testid={`menu-item-${command}`}
                  key={command}
                  focused={setFocus}
                  onExecute={() => onExecute(command)}
                />
              );
              if (setFocus) {
                foundFocusedItem = true;
              }
              return focusedItem;
            })}
          </InlineMenuGroup>
        ) : null;
      })}
    </div>
  );
};
