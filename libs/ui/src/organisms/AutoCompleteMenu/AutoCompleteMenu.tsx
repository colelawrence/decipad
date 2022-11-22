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
    boxShadow: `0px -1px 0px ${cssVar('strongHighlightColor')}`,
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
    border: `1px solid ${cssVar('strongHighlightColor')}`,
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
  type: string;
  editing?: boolean;
  focused?: boolean;
};

export interface AutoCompleteMenuProps {
  readonly identifiers: Identifier[];
  readonly search?: string;
  readonly onExecuteItem?: (identifier: Identifier) => void;
  readonly top?: boolean;
  readonly result?: string | null;
}

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
            kind: 'variable' as const,
            type: i.type,
            focused:
              isResult && i.kind === 'variable' && i.identifier === result,
          })),
      },
    ],
    [identifiers, isResult, result]
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
    setMathingIdentifiers((old) => {
      const newMatching = groupsWithItemsFiltered
        .flatMap(({ matchingItems }) => matchingItems)
        .map(({ identifier }) => identifier);
      if (dequal(old, newMatching)) return old;
      return newMatching;
    });
  }, [search, groupsWithItemsFiltered]);

  // AutoCompleteMenuItems do not use real browser focus, see their docs
  const [focusedItem, setFocusedItem] = useState<string>();

  const allItems = groupsWithItemsFiltered.flatMap((g) => g.matchingItems);

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

  useEffect(() => {
    if (matchingIdentifiers.length > 0 && !isResult) {
      setFocusedItem(matchingIdentifiers[0]);
    }
  }, [isResult, matchingIdentifiers]);

  return allItems.length ? (
    <span
      css={{ position: 'relative', zIndex: 3 }}
      className="test-auto-complete-menu"
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
          {groupsWithItemsFiltered.map(({ matchingItems, ...group }, i) =>
            matchingItems.length ? (
              <AutoCompleteMenuGroup key={i} {...group}>
                {matchingItems.map(({ ...item }) => (
                  <AutoCompleteMenuItem
                    {...item}
                    key={item.identifier}
                    focused={focusedItem === item.identifier || item.focused}
                    onExecute={() => onExecuteItem?.(item)}
                  />
                ))}
              </AutoCompleteMenuGroup>
            ) : null
          )}
        </div>
        <div css={footerStyles}>
          Press <span css={hotKeyStyle}>{isResult ? 'Enter' : 'Esc'}</span> to
          {isResult ? ' select' : ' dismiss'}
        </div>
      </div>
    </span>
  ) : null;
};
