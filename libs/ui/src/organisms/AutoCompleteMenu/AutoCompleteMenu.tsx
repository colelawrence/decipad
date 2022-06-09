import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import {
  ComponentProps,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AutoCompleteMenuItem } from '../../atoms';
import { AutoCompleteMenuGroup } from '../../molecules';
import { cssVar, mediumShadow, white } from '../../primitives';

type AutoCompleteGroup = Omit<
  ComponentProps<typeof AutoCompleteMenuGroup>,
  'children'
> & {
  readonly items: ReadonlyArray<Identifier>;
};

const styles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  overflow: 'hidden',
  top: '26px',
  left: 0,
  userSelect: 'none',

  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '0px 12px 12px 12px',
  boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
  position: 'absolute',
  width: '280px',
  maxHeight: '293px',
  background: white.rgb,
  boxSizing: 'border-box',
  zIndex: 1,
});

const mainStyles = css({
  padding: '8px',
  width: '100%',
});

export type Identifier = {
  kind: 'variable';
  identifier: string;
  type: string;
};

export interface AutoCompleteMenuProps {
  readonly identifiers: Identifier[];
  readonly search?: string;
  readonly onExecuteItem?: (identifier: Identifier) => void;
}

export const AutoCompleteMenu = ({
  search = '',
  identifiers,
  onExecuteItem,
}: AutoCompleteMenuProps): ReturnType<FC> => {
  const groups: ReadonlyArray<AutoCompleteGroup> = useMemo(
    () => [
      {
        title: 'Variables',
        items: identifiers
          .filter((i) => i.kind === 'variable')
          .map((i) => ({
            identifier: i.identifier,
            kind: 'variable' as const,
            type: i.type,
          })),
      },
    ],
    [identifiers]
  );
  const groupsWithItemsFiltered = useMemo(
    () =>
      groups.map(({ items, title, ...group }) => {
        const matchingItems = items.filter(({ identifier }) =>
          [identifier].some((term) => {
            return term.toLowerCase().includes(search.toLowerCase());
          })
        );
        return groups.length === 1
          ? { ...group, matchingItems }
          : { ...group, title, matchingItems };
      }),
    [search, groups]
  );

  const [matchingIdentifiers, setMathingIdentifiers] = useState(
    groupsWithItemsFiltered
      .flatMap(({ matchingItems }) => matchingItems)
      .map(({ identifier }) => identifier)
  );

  useEffect(() => {
    setMathingIdentifiers(
      groupsWithItemsFiltered
        .flatMap(({ matchingItems }) => matchingItems)
        .map(({ identifier }) => identifier)
    );
  }, [search, groupsWithItemsFiltered]);

  // AutoCompleteMenuItems do not use real browser focus, see their docs
  const [focusedItem, setFocusedItem] = useState<string>(
    matchingIdentifiers?.[0]
  );
  useEffect(() => {
    setFocusedItem(matchingIdentifiers?.[0]);
  }, [matchingIdentifiers]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (true) {
        case event.key === 'ArrowDown' && !event.shiftKey:
          const newFocusedItem =
            matchingIdentifiers[
              (focusedItem ? matchingIdentifiers.indexOf(focusedItem) : -1) + 1
            ] ?? matchingIdentifiers[0];
          setFocusedItem(newFocusedItem);
          event.stopPropagation();
          event.preventDefault();
          break;
        case event.key === 'ArrowUp' && !event.shiftKey:
          setFocusedItem(
            matchingIdentifiers[
              (focusedItem
                ? matchingIdentifiers.indexOf(focusedItem)
                : matchingIdentifiers.length) - 1
            ] ?? matchingIdentifiers.slice(-1)[0]
          );
          event.stopPropagation();
          event.preventDefault();
          break;
      }
    },
    [focusedItem, matchingIdentifiers]
  );
  useWindowListener('keydown', onKeyDown, true);

  const allItems = groupsWithItemsFiltered.flatMap((g) => g.matchingItems);

  return allItems.length ? (
    <span css={{ position: 'relative' }} className="test-auto-complete-menu">
      <div
        contentEditable={false}
        role="menu"
        aria-orientation="vertical"
        css={styles}
      >
        <div css={mainStyles}>
          {groupsWithItemsFiltered.map(({ matchingItems, ...group }, i) =>
            matchingItems.length ? (
              <AutoCompleteMenuGroup key={i} {...group}>
                {matchingItems.map(({ ...item }) => (
                  <AutoCompleteMenuItem
                    {...item}
                    key={item.identifier}
                    focused={focusedItem === item.identifier}
                    onExecute={() => onExecuteItem?.(item)}
                  />
                ))}
              </AutoCompleteMenuGroup>
            ) : null
          )}
        </div>
      </div>
    </span>
  ) : null;
};
