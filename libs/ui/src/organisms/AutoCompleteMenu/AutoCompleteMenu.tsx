/* eslint decipad/css-prop-named-variable: 0 */
import { ClientEventsContext } from '@decipad/client-events';
import { useWindowListener } from '@decipad/react-utils';
import { docs } from '@decipad/routing';
import { ItemBlockId, matchItemBlocks } from '@decipad/utils';
import { css } from '@emotion/react';
import Fuse from 'fuse.js';
import { once } from 'ramda';
import {
  ComponentProps,
  FC,
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ACItemType,
  AutoCompleteMenuFormulaTooltip,
  AutoCompleteMenuItem,
  Link,
} from '../../atoms';
import {} from '../../atoms/AutoCompleteMenuItem/AutoCompleteMenuItem';
import { ArrowDiagonalTopRight } from '../../icons/ArrowDiagonalTopRight/ArrowDiagonalTopRight';
import { AutoCompleteMenuGroup } from '../../molecules';
import { cssVar, mediumShadow, p12Medium, setCssVar } from '../../primitives';
import { groupIdentifiers } from './groupIdentifiers';

export type AutoCompleteGroup = Omit<
  ComponentProps<typeof AutoCompleteMenuGroup>,
  'children'
> & {
  readonly items: ReadonlyArray<Identifier>;
};

export type Identifier = {
  kind: 'variable' | 'function' | 'column';
  identifier: string;
  blockId?: string;
  columnId?: string;
  type: ACItemType;
  inTable?: string;
  editing?: boolean;
  focused?: boolean;
  explanation?: string;
  syntax?: string;
  example?: string;
  formulaGroup?: string;
  isCell?: boolean;
};

export interface AutoCompleteMenuProps {
  readonly isInTable?: string;
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

const groupItems = (g: AutoCompleteGroup) => g.items;

const searchOptions = once(
  (): Fuse.IFuseOptions<AutoCompleteGroup['items'][0]> => ({
    keys: ['identifier', { name: 'explanation', weight: 0.5 }],
    isCaseSensitive: false,
    shouldSort: true,
    threshold: 0.3,
    fieldNormWeight: 2,
  })
);

/**
 * Currently disabling react exaustive deps because this logic needs to be refactored,
 * into smaller hooks.
 */
export const AutoCompleteMenu = ({
  isInTable = '',
  search = '',
  identifiers,
  onExecuteItem,
  top = true,
  result = '',
}: AutoCompleteMenuProps): ReturnType<FC> => {
  const clientEvent = useContext(ClientEventsContext);

  const handleMouseDown: MouseEventHandler<HTMLSpanElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );
  const handleClientEvent = useCallback(() => {
    clientEvent({
      type: 'action',
      action: 'visit docs',
      props: {
        source: 'Autocomplete Menu',
      },
    });
  }, [clientEvent]);

  const isResult = result !== '';
  const groups = useMemo(() => {
    return groupIdentifiers(identifiers, isResult, result, isInTable);
  }, [identifiers, isResult, result, isInTable]);

  const searchGroups = useMemo(
    () =>
      !!search &&
      groups.map((group): SearchGroup => {
        return {
          group,
          index: new Fuse(group.items, searchOptions()),
        };
      }),
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
      groups.map(({ items, ...group }) => ({ group, items })),
    [groups, search, searchGroups]
  );

  const matchingIdentifiers = useMemo(
    () =>
      groupsWithItemsFiltered
        .flatMap(groupItems)
        .map(({ identifier, columnId, blockId }) => ({
          identifier,
          blockId,
          columnId,
        })),
    [groupsWithItemsFiltered]
  );

  // AutoCompleteMenuItems do not use real browser focus, see their docs
  const [focusedItem, setFocusedItem] = useState<ItemBlockId>();
  const [hovoredItem, setHoveredItem] = useState<Identifier>();

  const onMouseLeave = useCallback(() => {
    setHoveredItem(
      groupsWithItemsFiltered
        .flatMap(groupItems)
        .find((item) => item.identifier === focusedItem?.identifier)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allItems = groupsWithItemsFiltered.flatMap(groupItems);
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (true) {
        case event.key === 'ArrowDown' && !event.shiftKey:
          const newFocusedItemUp =
            matchingIdentifiers[
              (focusedItem
                ? matchingIdentifiers.findIndex((elem) =>
                    matchItemBlocks(elem, focusedItem)
                  )
                : -1) + 1
            ] ?? matchingIdentifiers[0];
          setFocusedItem(newFocusedItemUp);
          setHoveredItem(
            groupsWithItemsFiltered
              .flatMap(groupItems)
              .find((item) => item.identifier === newFocusedItemUp?.identifier)
          );
          event.stopPropagation();
          event.preventDefault();
          break;
        case event.key === 'ArrowUp' && !event.shiftKey:
          const newFocusedItemDown =
            matchingIdentifiers[
              (focusedItem
                ? matchingIdentifiers.findIndex((elem) =>
                    matchItemBlocks(elem, focusedItem)
                  )
                : matchingIdentifiers.length) - 1
            ] ?? matchingIdentifiers.slice(-1)[0];
          setFocusedItem(newFocusedItemDown);
          setHoveredItem(
            groupsWithItemsFiltered
              .flatMap(groupItems)
              .find(
                (item) => item.identifier === newFocusedItemDown?.identifier
              )
          );
          event.stopPropagation();
          event.preventDefault();
          break;
        default:
          if (hovoredItem?.explanation) {
            setHoveredItem(
              groupsWithItemsFiltered
                .flatMap(groupItems)
                .find((item) => item.identifier === focusedItem?.identifier)
            );
          }
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedItem, matchingIdentifiers, groupsWithItemsFiltered]
  );
  useWindowListener('keydown', onKeyDown, true);

  useEffect(() => {
    if (matchingIdentifiers.length > 0 && !isResult) {
      setFocusedItem(matchingIdentifiers[0]);
      if (hovoredItem?.explanation) {
        setHoveredItem(
          groupsWithItemsFiltered
            .flatMap(groupItems)
            .find(
              (item) => item.identifier === matchingIdentifiers[0]?.identifier
            )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResult, matchingIdentifiers]);

  if (allItems.length === 0) {
    return null;
  }

  return (
    <span
      css={{ position: 'relative', zIndex: 3 }}
      className="test-auto-complete-menu"
      onMouseLeave={onMouseLeave}
    >
      <div
        contentEditable={false}
        role="menu"
        aria-orientation="vertical"
        css={[styles(top), isResult && resultStyles]}
      >
        <div
          css={css({
            display: 'flex',
            maxHeight: '166px',
          })}
        >
          <div
            css={[
              mainStyles,
              allItems.length > 5 && {
                maxHeight: '166px',
                overflowY: 'scroll',
              },
            ]}
          >
            {groupsWithItemsFiltered.map(({ items, group }, i) =>
              items.length ? (
                <AutoCompleteMenuGroup
                  key={i}
                  {...group}
                  isOnlyGroup={groupsWithItemsFiltered.length === 1}
                >
                  {items.map(({ ...item }) => {
                    return (
                      <AutoCompleteMenuItem
                        {...item}
                        key={
                          item.blockId
                            ? `${item.blockId}__${item.identifier}`
                            : item.identifier
                        }
                        focused={
                          matchItemBlocks(item, focusedItem) || item.focused
                        }
                        onExecute={() => onExecuteItem?.(item)}
                        onHover={() => setHoveredItem(item)}
                      />
                    );
                  })}
                </AutoCompleteMenuGroup>
              ) : null
            )}
          </div>
          {hovoredItem?.explanation && (
            <AutoCompleteMenuFormulaTooltip
              explanation={hovoredItem?.explanation}
              syntax={hovoredItem?.syntax}
              example={hovoredItem?.example}
              formulaGroup={hovoredItem?.formulaGroup}
            />
          )}
        </div>
        <div css={footerStyles} data-testid="autocomplete-tooltip">
          <span>
            <span css={hotKeyStyle}>{isResult ? 'Enter' : 'Esc'}</span> to
            {isResult ? ' select' : ' dismiss'}
          </span>
          {hovoredItem?.explanation !== undefined && (
            <>
              <span onMouseDown={handleMouseDown}>
                <Link
                  href={docs({}).page({ name: 'formulas' }).$}
                  onClick={handleClientEvent}
                >
                  Explore Docs
                  <span css={exploreDocsLinkIconStyles}>
                    <ArrowDiagonalTopRight />
                  </span>
                </Link>
              </span>
            </>
          )}
        </div>
      </div>
    </span>
  );
};

const hotKeyStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: '1.5',
  boxSizing: 'border-box',
  borderRadius: '6px',
  padding: '0 4px',
  border: `1px ${cssVar('strongerHighlightColor')} solid`,
  backgroundColor: cssVar('backgroundColor'),
  color: cssVar('weakTextColor'),
});

const exploreDocsLinkIconStyles = css({
  display: 'flex',
  alignItems: 'center',
  float: 'right',
  borderRadius: '4px',
  height: '15px',
  width: '20px',
  padding: '12px 0px 5px 3px',
  marginLeft: 'auto',
  svg: {
    width: '10px',
    height: '10px',
  },
});

const footerStyles = css(
  p12Medium,
  {
    padding: '2px 0px 4px 6px',
    width: '100%',
    bottom: '0px',
    height: '26px',
    lineHeight: '24px',
    background: cssVar('highlightColor'),
    boxShadow: `0px -1px 0px ${cssVar('borderColor')}`,
    margin: '0px 0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4px',
    zIndex: '4',
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
    borderRadius: '10px',
    boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
    position: 'absolute',
    boxSizing: 'border-box',
    zIndex: 2,
  });

const mainStyles = css({
  padding: '3px 3px 8px 3px',
  width: '200px',
  maxHeight: '166px',
  overflowY: 'auto',
});
