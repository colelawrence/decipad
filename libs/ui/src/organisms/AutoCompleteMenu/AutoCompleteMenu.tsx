import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { dequal } from 'dequal';
import {
  ComponentProps,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Fuse from 'fuse.js';
import { AutoCompleteMenuItem } from '../../atoms';
import { AutoCompleteMenuGroup } from '../../molecules';
import { cssVar, mediumShadow, p13Medium, setCssVar } from '../../primitives';

type AutoCompleteGroup = Omit<
  ComponentProps<typeof AutoCompleteMenuGroup>,
  'children'
> & {
  readonly items: ReadonlyArray<Identifier>;
};

const hotKeyStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',

  boxSizing: 'border-box',
  borderRadius: '6px',
  padding: '0 6px',
  border: `1px ${cssVar('strongerHighlightColor')} solid`,
  backgroundColor: cssVar('backgroundColor'),
  color: cssVar('weakTextColor'),
});

const footerStyles = css(
  p13Medium,
  {
    padding: '6px 0px 8px 16px',
    width: '100%',
    bottom: '0px',
    height: '32px',
    lineHeight: '24px',
    background: cssVar('highlightColor'),
    boxShadow: `0px -1px 0px ${cssVar('borderColor')}`,
    margin: '0px 0px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  setCssVar('currentTextColor', cssVar('weakTextColor'))
);

const resultStyles = css({
  display: 'block',
  maxWidth: '244px',
  minWidth: '149px',
  marginTop: '8px',
});

const styles = (top: boolean) =>
  css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    overflowX: 'hidden',
    top: top ? '26px' : '0px',
    left: 0,
    userSelect: 'none',

    backgroundColor: cssVar('backgroundColor'),
    border: `1px solid ${cssVar('borderColor')}`,
    borderRadius: '12px',
    boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
    position: 'absolute',
    width: '280px',
    boxSizing: 'border-box',
    zIndex: 2,
  });

const mainStyles = css({
  padding: '6px',
  width: '100%',
});

export type Identifier = {
  kind: 'variable' | 'function';
  identifier: string;
  blockId?: string;
  type: string;
  editing?: boolean;
  focused?: boolean;
  explanation?: string;
};

export interface AutoCompleteMenuProps {
  readonly identifiers: Identifier[];
  readonly search?: string;
  readonly onExecuteItem?: (identifier: Identifier) => void;
  readonly top?: boolean;
  readonly result?: string | null;
}

interface SearchGroup {
  group: AutoCompleteGroup;
  index: Fuse<Identifier>;
}

interface SearchResultGroup {
  group: AutoCompleteGroup;
  items: AutoCompleteGroup['items'];
}

type ItemBlockId = {
  identifier: string;
  blockId?: string;
};

const groupItems = (g: AutoCompleteGroup) => g.items;

const matchBlockIdOrIdentifier = (
  a: ItemBlockId,
  b: ItemBlockId | undefined
) => {
  if (a.blockId && b?.blockId) {
    return a.blockId === b.blockId;
  }
  return a.identifier === b?.identifier;
};

export const AutoCompleteMenu = ({
  search = '',
  identifiers,
  onExecuteItem,
  top = true,
  result = '',
}: AutoCompleteMenuProps): ReturnType<FC> => {
  const isResult = result !== '';
  const groups: ReadonlyArray<AutoCompleteGroup> = useMemo(
    () => [
      {
        title: 'Variables',
        items: identifiers
          .filter((i) => i.kind === 'variable' || i.kind === 'function')
          .map((i) => ({
            identifier: i.identifier,
            explanation: i.explanation,
            blockId: i.blockId,
            kind: 'variable' as const,
            type: i.type,
            focused:
              isResult && i.kind === 'variable' && i.identifier === result,
          })),
      },
    ],
    [identifiers, isResult, result]
  );

  const searchGroups = useMemo(
    () =>
      !!search &&
      groups.map(
        (group): SearchGroup => ({
          group,
          index: new Fuse(group.items, {
            keys: ['identifier', 'explanation'],
            isCaseSensitive: false,
            shouldSort: true,
          }),
        })
      ),
    [groups, search]
  );

  const groupsWithItemsFiltered = useMemo(
    () =>
      (searchGroups &&
        searchGroups?.map(
          (searchGroup): SearchResultGroup => ({
            group: searchGroup.group,
            items: searchGroup.index.search(search).map(({ item }) => item),
          })
        )) ||
      groups,
    [groups, search, searchGroups]
  );

  const [matchingIdentifiers, setMathingIdentifiers] = useState(
    groupsWithItemsFiltered
      .flatMap(groupItems)
      .map(({ identifier, blockId }) => ({ identifier, blockId }))
  );

  useEffect(() => {
    setMathingIdentifiers((old) => {
      const newMatching = groupsWithItemsFiltered
        .flatMap(groupItems)
        .map(({ identifier, blockId }) => ({ identifier, blockId }));
      if (dequal(old, newMatching)) return old;
      return newMatching;
    });
  }, [search, groupsWithItemsFiltered]);

  // AutoCompleteMenuItems do not use real browser focus, see their docs
  const [focusedItem, setFocusedItem] = useState<ItemBlockId>();

  const allItems = groupsWithItemsFiltered.flatMap(groupItems);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (true) {
        case event.key === 'ArrowDown' && !event.shiftKey:
          const newFocusedItem =
            matchingIdentifiers[
              (focusedItem
                ? matchingIdentifiers.findIndex((elem) =>
                    matchBlockIdOrIdentifier(elem, focusedItem)
                  )
                : -1) + 1
            ] ?? matchingIdentifiers[0];
          setFocusedItem(newFocusedItem);
          event.stopPropagation();
          event.preventDefault();
          break;
        case event.key === 'ArrowUp' && !event.shiftKey:
          setFocusedItem(
            matchingIdentifiers[
              (focusedItem
                ? matchingIdentifiers.findIndex((elem) =>
                    matchBlockIdOrIdentifier(elem, focusedItem)
                  )
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

  useEffect(() => {
    if (matchingIdentifiers.length > 0 && !isResult) {
      setFocusedItem(matchingIdentifiers[0]);
    }
  }, [isResult, matchingIdentifiers]);

  const [hovering, setHovering] = useState(false);
  const onMouseEnter = useCallback(() => {
    setHovering(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setHovering(false);
  }, []);

  return allItems.length ? (
    <span
      css={{ position: 'relative', zIndex: 3 }}
      className="test-auto-complete-menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        contentEditable={false}
        role="menu"
        aria-orientation="vertical"
        css={[styles(top), isResult && resultStyles]}
      >
        <div
          css={[
            mainStyles,
            allItems.length > 5 && {
              height: '200px',
              overflowY: 'scroll',
            },
          ]}
        >
          {groupsWithItemsFiltered.map(({ items, ...group }, i) =>
            items.length ? (
              <AutoCompleteMenuGroup key={i} {...group}>
                {items.map(({ ...item }) => (
                  <AutoCompleteMenuItem
                    {...item}
                    key={item.blockId ?? item.identifier}
                    hoveringSome={hovering}
                    focused={
                      matchBlockIdOrIdentifier(item, focusedItem) ||
                      item.focused
                    }
                    onExecute={() => onExecuteItem?.(item)}
                  />
                ))}
              </AutoCompleteMenuGroup>
            ) : null
          )}
        </div>
        <div css={footerStyles} data-testid="autocomplete-tooltip">
          Press <span css={hotKeyStyle}>{isResult ? 'Enter' : 'Esc'}</span> to
          {isResult ? ' select' : ' dismiss'}
        </div>
      </div>
    </span>
  ) : null;
};
