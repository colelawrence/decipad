/* eslint decipad/css-prop-named-variable: 0 */
import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import * as Popover from '@radix-ui/react-popover';
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Add, MagnifyingGlass } from 'libs/ui/src/icons';
import {
  DropdownEditOption,
  EditItemsOptions,
  SelectItems,
  selectItemDOMId,
} from '../../molecules';
import {
  cssVar,
  mediumShadow,
  p12Regular,
  p13Medium,
} from '../../../primitives';
import { deciOverflowYStyles } from '../../../styles/scrollbars';
import { DropdownMenuGroup } from '../DropdownMenuGroup/DropdownMenuGroup';
import { DropdownInput } from '../../atoms';

const styles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  overflowX: 'hidden',
  top: '48px',
  left: 0,
  userSelect: 'none',

  marginTop: '8px',
  backgroundColor: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: '12px',
  boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
  width: 'var(--radix-popper-anchor-width)',
  minWidth: '244px',
  boxSizing: 'border-box',
});

const mainStyles = css(
  {
    padding: '6px',
    marginTop: '2px',
    marginBottom: '2px',
    width: '100%',
    maxHeight: '300px',
  },
  deciOverflowYStyles
);

const footerStyles = css(p13Medium, {
  padding: '6px 0px 8px 16px',
  width: '100%',
  bottom: '0px',
  height: '32px',
  lineHeight: '24px',
  background: cssVar('backgroundDefault'),
  boxShadow: `0px -1px 0px ${cssVar('borderSubdued')}`,
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const hotKeyStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',

  boxSizing: 'border-box',
  borderRadius: '6px',
  padding: '0 6px',
  border: `1px ${cssVar('borderSubdued')} solid`,
  backgroundColor: cssVar('backgroundMain'),
  color: cssVar('textSubdued'),
});

const emptyStyle = css([
  p12Regular,
  {
    height: '32px',
    display: 'flex',
    paddingLeft: '4px',
    paddingRight: '4px',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: cssVar('textSubdued'),
  },
]);

export type DropdownMenuProps = EditItemsOptions & {
  readonly open: boolean;
  readonly setOpen: (a: boolean) => void;
  readonly isReadOnly?: boolean;
  readonly isCombobox?: boolean;
  /** The title will define a category for the items */
  readonly items: Array<SelectItems>;
  readonly isEditingAllowed?: boolean;
  readonly addOption?: (a: string) => void;
  readonly children?: ReactNode;
  readonly selectedId?: string;
  readonly renderEmpty?: ReactNode;
};

/**
 * A general purpose dropdown component, mostly used by the result and dropdown widget.
 */
export const DropdownMenu: FC<DropdownMenuProps> = ({
  open,
  setOpen,
  isReadOnly = false,
  isCombobox = false,
  items,
  addOption = noop,
  onExecute,
  onEditOption,
  onRemoveOption,
  isEditingAllowed = false,
  children,
  selectedId,
  renderEmpty,
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState(false);
  const [focusedId, setFocusedId] = useState(selectedId);

  const itemsLength = items.length;
  const showInput = isEditingAllowed && (addingNew || itemsLength === 0);
  const trimmedSearch = search.replaceAll(/\s+/g, '').toLowerCase();

  useLayoutEffect(() => {
    if (open) {
      setFocusedId(selectedId);
    } else {
      setSearch('');
    }
  }, [open, selectedId]);

  const filteredItems = useMemo(
    () =>
      items.filter(
        ({ item, group }) =>
          !trimmedSearch ||
          item.toLowerCase().includes(trimmedSearch) ||
          group?.toLowerCase().includes(trimmedSearch)
      ),
    [items, trimmedSearch]
  );

  const filteredItemsLength = filteredItems.length;

  /**
   * Splits the given content into various groups.
   */
  const groups = useMemo(
    () =>
      Object.entries(
        filteredItems.reduce((prev, next) => {
          if (!next.group) {
            if (!prev['']) {
              /* eslint no-param-reassign: "error" */
              prev[''] = [];
            }
            prev[''].push(next);
            return prev;
          }

          if (next.group! in prev) {
            prev[next.group].push(next);
            return prev;
          }
          /* eslint no-param-reassign: "error" */
          prev[next.group] = [next];
          return prev;
        }, {} as Record<string, Array<SelectItems>>)
      ),
    [filteredItems]
  );

  // A flat list of items in the same order as they appear in groups
  const orderedItems = useMemo(
    () => groups.flatMap(([, groupItems]) => groupItems),
    [groups]
  );

  const setFocusedIndex = useCallback(
    (setter: (focusedIndex?: number) => number) => {
      const currentFocusedIndex = orderedItems.findIndex(
        ({ id }) => id === focusedId
      );
      const newFocusedIndex = setter(
        currentFocusedIndex === -1 ? undefined : currentFocusedIndex
      );
      setFocusedId(orderedItems[newFocusedIndex]?.id);
    },
    [orderedItems, focusedId]
  );

  const focusFirst = useCallback(
    () => setFocusedIndex(() => 0),
    [setFocusedIndex]
  );

  const moveDown = useCallback(() => {
    setFocusedIndex(
      (focusedIndex = 0) => (focusedIndex + 1) % filteredItemsLength
    );
  }, [setFocusedIndex, filteredItemsLength]);

  const moveUp = useCallback(() => {
    setFocusedIndex((focusedIndex = 0) =>
      focusedIndex === 0 ? filteredItemsLength - 1 : focusedIndex - 1
    );
  }, [setFocusedIndex, filteredItemsLength]);

  // Focus first when search changes
  const previousSearch = useRef(search);
  useLayoutEffect(() => {
    if (open && search && search !== previousSearch.current) {
      focusFirst();
    }
    previousSearch.current = search;
  }, [open, search, focusFirst]);

  // Handles keyboard selection of items (up and down), as well as
  // Enter press when user is adding new option
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;
      switch (true) {
        case event.key === 'Enter' && inputValue.length > 0 && showInput:
          if (items.some((i) => i.item === inputValue)) {
            setError(true);
          } else {
            addOption(inputValue);
            setInputValue('');
            setAddingNew(false);
            event.preventDefault();
            event.stopPropagation();
          }
          break;
        case event.key === 'Escape':
          setOpen(false);
          break;
        case event.key === 'ArrowDown':
          event.preventDefault();
          moveDown();
          break;
        case event.key === 'ArrowUp':
          event.preventDefault();
          moveUp();
          break;
      }
    },
    [open, inputValue, showInput, items, setOpen, addOption, moveUp, moveDown]
  );

  useWindowListener('keydown', onKeyDown);

  useEffect(() => {
    if (showInput && open) {
      ref.current?.focus();
    }
  }, [showInput, open]);

  const id = useId();
  const activeDescendant = focusedId && selectItemDOMId(focusedId);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger css={{ width: '100%', cursor: 'inherit' }}>
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          style={{ zIndex: '100' }}
          role="listbox"
          aria-activedescendant={activeDescendant}
          id={id}
        >
          <div css={styles}>
            <div css={mainStyles}>
              {isCombobox && (
                <DropdownInput
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  aria-label="Search"
                  role="combobox"
                  aria-activedescendant={activeDescendant}
                  aria-expanded={true}
                  aria-controls={id}
                  aria-autocomplete="list"
                  autoFocus
                  iconLeft={<MagnifyingGlass />}
                />
              )}

              {groups.map(([key, groupItems]) => (
                <DropdownMenuGroup
                  key={key}
                  title={key.length === 0 ? undefined : key}
                  items={groupItems}
                  onExecute={onExecute}
                  onEditOption={onEditOption}
                  onRemoveOption={onRemoveOption}
                  isEditingAllowed={isEditingAllowed}
                  focusedId={focusedId}
                  selectedId={selectedId}
                />
              ))}

              {groups.length === 0 && renderEmpty && (
                <div css={emptyStyle}>{renderEmpty}</div>
              )}

              {!isReadOnly && showInput && (
                <DropdownEditOption
                  value={inputValue}
                  setValue={setInputValue}
                  error={error}
                />
              )}
            </div>

            {!isReadOnly && isEditingAllowed && (
              <div
                css={footerStyles}
                onClick={() => {
                  if (addingNew) {
                    addOption(inputValue);
                    setInputValue('');
                    setAddingNew(false);
                  } else {
                    setAddingNew(true);
                  }
                }}
              >
                {addingNew ? (
                  <>
                    Press <span css={hotKeyStyle}>Enter</span> to save
                  </>
                ) : (
                  <>
                    <div css={{ width: 16, height: 16 }}>
                      <Add />
                    </div>
                    Add new
                  </>
                )}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
