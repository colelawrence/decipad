/* eslint decipad/css-prop-named-variable: 0 */
import { analytics } from '@decipad/client-events';
import type { SmartRefDecoration } from '@decipad/editor-types';
import { useWindowListener } from '@decipad/react-utils';
import { docs } from '@decipad/routing';
import { type ItemBlockId, matchItemBlocks, noop } from '@decipad/utils';
import { css } from '@emotion/react';
import Fuse from 'fuse.js';
import {
  type ComponentProps,
  type FC,
  type MouseEventHandler,
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from '../../../shared';
import { AutoCompleteMenuFormulaTooltip } from '../AutoCompleteMenuFormulaTooltip/AutoCompleteMenuFormulaTooltip';
import { AutoCompleteMenuItem } from '../AutoCompleteMenuItem/AutoCompleteMenuItem';
import { ArrowDiagonalTopRight } from '../../../icons';
import { AutoCompleteMenuGroup } from '../AutoCompleteMenuGroup/AutoCompleteMenuGroup';
import {
  cssVar,
  mediumShadow,
  p10Medium,
  p12Medium,
} from '../../../primitives';
import { deciOverflowYStyles } from '../../../styles/scrollbars';
import { groupIdentifiers } from './groupIdentifiers';
import { useCancelingEvent } from '../../../utils';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverPortal,
} from '@radix-ui/react-popover';
import { Identifier } from './types';

export type AutoCompleteGroup = Omit<
  ComponentProps<typeof AutoCompleteMenuGroup>,
  'children'
> & {
  readonly items: ReadonlyArray<Identifier>;
};

export type AutoCompleteMenuMode = 'default' | 'tableCell';

export interface AutoCompleteMenuProps {
  readonly mode?: AutoCompleteMenuMode;
  readonly isInTable?: string;
  readonly identifiers: Identifier[];
  readonly search?: string;
  readonly onExecuteItem?: (
    identifier: Identifier,
    ref?: SmartRefDecoration
  ) => void;
  readonly result?: string | null;
  readonly openRef?: MutableRefObject<boolean>;
}

const groupItems = (g: AutoCompleteGroup) => g.items;

type FilterStrategy = (items: Identifier[], search: string) => Identifier[];

const fuseFilterStrategy: FilterStrategy = (items, search) => {
  if (!search) return items;

  const fuse = new Fuse(items, {
    keys: ['name', { name: 'explanation', weight: 0.5 }],
    isCaseSensitive: false,
    shouldSort: true,
    threshold: 0.3,
    fieldNormWeight: 2,
  });

  return fuse.search(search).map(({ item }) => item);
};

const prefixFilterStrategy: FilterStrategy = (items, search) =>
  items.filter((item) =>
    item.name.toLowerCase().startsWith(search.toLowerCase())
  );

const filterStrategyForMode: Record<AutoCompleteMenuMode, FilterStrategy> = {
  default: fuseFilterStrategy,
  tableCell: prefixFilterStrategy,
};

/**
 * Currently disabling react exaustive deps because this logic needs to be refactored,
 * into smaller hooks.
 */
export const AutoCompleteMenu = ({
  mode = 'default',
  isInTable = '',
  search = '',
  identifiers,
  onExecuteItem,
  result = '',
  openRef,
}: AutoCompleteMenuProps): ReturnType<FC> => {
  const handleMouseDown: MouseEventHandler<HTMLSpanElement> =
    useCancelingEvent(noop);
  const handleClientEvent = useCallback(() => {
    analytics.track({
      type: 'action',
      action: 'Documentation Button Clicked',
      props: {
        analytics_source: 'frontend',
      },
    });
  }, []);

  const isResult = result !== '';
  const groups = useMemo(() => {
    return groupIdentifiers(identifiers, isResult, result, isInTable);
  }, [identifiers, isResult, result, isInTable]);

  const groupsWithItemsFiltered = useMemo(
    () =>
      groups.map((group) => ({
        group,
        items: filterStrategyForMode[mode](group.items, search),
      })),
    [groups, search, mode]
  );

  const matchingIdentifiers = useMemo(
    () =>
      groupsWithItemsFiltered
        .flatMap(groupItems)
        .map(({ name, columnId, blockId }) => ({
          name,
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
        .find((item) => item.name === focusedItem?.name)
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
              .find((item) => item.name === newFocusedItemUp?.name)
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
              .find((item) => item.name === newFocusedItemDown?.name)
          );
          event.stopPropagation();
          event.preventDefault();
          break;
        default:
          if (hovoredItem?.explanation) {
            setHoveredItem(
              groupsWithItemsFiltered
                .flatMap(groupItems)
                .find((item) => item.name === focusedItem?.name)
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
            .find((item) => item.name === matchingIdentifiers[0]?.name)
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResult, matchingIdentifiers]);

  const open = allItems.length > 0;

  if (openRef) {
    // eslint-disable-next-line no-param-reassign
    openRef.current = open;
  }

  return (
    <Popover open={open}>
      <PopoverAnchor asChild>
        <span />
      </PopoverAnchor>
      <PopoverPortal>
        <PopoverContent
          align="start"
          css={{ zIndex: 70 }}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onMouseLeave={onMouseLeave}
        >
          <div
            contentEditable={false}
            role="menu"
            aria-orientation="vertical"
            css={[styles, isResult && resultStyles]}
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
                data-testid="auto-complete-variable-drawer"
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
                            item={item}
                            key={
                              item.blockId
                                ? `${item.blockId}__${item.name}`
                                : item.name
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
              {mode === 'tableCell' ? (
                <div
                  css={{
                    width:
                      hovoredItem?.explanation !== undefined ? '100%' : '180px',
                    marginTop: '4px',
                    marginBottom: '4px',
                  }}
                >
                  <p css={p10Medium}>
                    We currently only support number, string, date and boolean
                    variables in tables.
                  </p>
                </div>
              ) : (
                <span>
                  <span css={hotKeyStyle}>{isResult ? 'Enter' : 'Esc'}</span> to
                  {isResult ? ' select' : ' dismiss'}
                </span>
              )}
              {hovoredItem?.explanation !== undefined && (
                <>
                  <span onMouseDown={handleMouseDown}>
                    <Link
                      href={docs({}).page({ name: 'functions-list' }).$}
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
        </PopoverContent>
      </PopoverPortal>
    </Popover>
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
  border: `1px ${cssVar('borderSubdued')} solid`,
  backgroundColor: cssVar('backgroundMain'),
  color: cssVar('textSubdued'),
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

const footerStyles = css(p12Medium, {
  overflowWrap: 'break-word',
  padding: '2px 0px 4px 6px',
  width: '100%',
  bottom: '0px',
  minHeight: '26px',
  lineHeight: '24px',
  background: cssVar('backgroundDefault'),
  boxShadow: `0px -1px 0px ${cssVar('borderSubdued')}`,
  margin: '0px 0px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'space-between',
  justifyContent: 'space-between',
  gap: '4px',
  zIndex: '4',
});

const resultStyles = css({
  display: 'block',
  maxWidth: '244px',
  minWidth: '149px',
  marginTop: '8px',
});

const styles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  overflowX: 'hidden',
  userSelect: 'none',

  backgroundColor: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '10px',
  boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
  boxSizing: 'border-box',
});

const mainStyles = css(
  {
    padding: '3px 3px 8px 3px',
    width: '200px',
    maxHeight: '166px',
  },
  deciOverflowYStyles
);
