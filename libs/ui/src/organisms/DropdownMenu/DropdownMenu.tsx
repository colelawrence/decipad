import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import * as Popover from '@radix-ui/react-popover';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditItemsOptions, SelectItems } from '../../atoms';
import { Plus } from '../../icons';
import { DropdownOption } from '../../molecules';
import { cssVar, mediumShadow, p13Medium, setCssVar } from '../../primitives';
import { DropdownMenuGroup } from '../DropdownMenuGroup/DropdownMenuGroup';

export type { SelectItems } from '../../atoms';

const styles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  overflowX: 'hidden',
  marginTop: '8px',
  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '12px',
  boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
  width: '100%',
  maxWidth: '244px',
  minWidth: '244px',
  boxSizing: 'border-box',
});

const mainStyles = css({
  padding: '6px',
  marginTop: '2px',
  marginBottom: '2px',
  width: '100%',
  overflowY: 'auto',
  maxHeight: '300px',
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
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  setCssVar('currentTextColor', cssVar('weakTextColor'))
);

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

export type DropdownMenuProps = EditItemsOptions & {
  readonly open: boolean;
  readonly setOpen: (a: boolean) => void;
  readonly isReadOnly?: boolean;
  /** The title will define a category for the items */
  readonly groups: Array<SelectItems>;
  readonly isEditingAllowed?: boolean;
  readonly addOption?: (a: string) => void;
  readonly children: JSX.Element;
};

/**
 * A general purpose dropdown component, mostly used by the result and dropdown widget.
 */
export const DropdownMenu: FC<DropdownMenuProps> = ({
  open,
  setOpen,
  isReadOnly = false,
  groups,
  addOption = noop,
  onExecute,
  onEditOption,
  onRemoveOption,
  isEditingAllowed = false,
  children,
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState(false);
  const [focusedItem, setFocusedItem] = useState(0);

  const showInput = isEditingAllowed && (addingNew || groups.length === 0);

  /**
   * Splits the given content into various groups.
   */
  const splitGroups = useMemo(
    () =>
      groups.reduce((prev, next) => {
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
      }, {} as Record<string, Array<SelectItems>>),
    [groups]
  );

  // Handles keyboard selection of items (up and down), as well as
  // Enter press when user is adding new option
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;
      switch (true) {
        case event.key === 'Enter' && inputValue.length > 0 && showInput:
          if (groups.some((i) => i.item === inputValue)) {
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
          setFocusedItem((focusedItem + 1) % groups.length);
          break;
        case event.key === 'ArrowUp':
          if (focusedItem === 0) {
            setFocusedItem(groups.length - 1);
            break;
          }
          setFocusedItem(focusedItem - 1);
      }
    },
    [open, addOption, inputValue, groups, showInput, setOpen, focusedItem]
  );

  useWindowListener('keydown', onKeyDown);

  useEffect(() => {
    if (showInput && open) {
      ref.current?.focus();
    }
  }, [showInput, open]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger css={{ width: '100%', cursor: 'inherit' }}>
        {children}
      </Popover.Trigger>
      <Popover.Content>
        <div css={styles}>
          <div css={mainStyles}>
            {Object.entries(splitGroups).map(([key, items]) => (
              <DropdownMenuGroup
                key={key}
                title={key.length === 0 ? undefined : key}
                items={items}
                onExecute={onExecute}
                onEditOption={onEditOption}
                onRemoveOption={onRemoveOption}
                isEditingAllowed={!isReadOnly && isEditingAllowed}
                focusedItem={focusedItem}
              />
            ))}
            {!isReadOnly && showInput && (
              <DropdownOption
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
                    <Plus />
                  </div>
                  Add new
                </>
              )}
            </div>
          )}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
