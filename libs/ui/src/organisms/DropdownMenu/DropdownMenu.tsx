import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import * as Popover from '@radix-ui/react-popover';
import { nanoid } from 'nanoid';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { EditItemsOptions, SelectItems } from '../../atoms';
import { Plus } from '../../icons';
import { DropdownOption } from '../../molecules';
import { cssVar, mediumShadow, p13Medium, setCssVar } from '../../primitives';
import { DropdownMenuGroup } from '../DropdownMenuGroup/DropdownMenuGroup';

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

type DropdownMenuProps = EditItemsOptions & {
  readonly open: boolean;
  readonly setOpen: (a: boolean) => void;
  readonly isReadOnly: boolean;
  readonly items: Array<SelectItems>;
  readonly otherItems?: Array<{ title?: string; items: Array<SelectItems> }>;
  readonly addOption?: (a: string) => void;
  readonly children: JSX.Element;
};

export const DropdownMenu: FC<DropdownMenuProps> = ({
  open,
  setOpen,
  isReadOnly,
  items,
  otherItems = [],
  addOption = noop,
  onExecute,
  onEditOption,
  onRemoveOption,
  children,
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [error, setError] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const showInput = items.length === 0 || addingNew;

  // Handles keyboard selection of items (up and down), as well as
  // Enter press when user is adding new option
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;
      switch (true) {
        case event.key === 'ArrowDown' && !event.shiftKey:
          setFocusedIndex(
            focusedIndex === items.length - 1 ? 0 : focusedIndex + 1
          );
          break;
        case event.key === 'ArrowUp' && !event.shiftKey:
          setFocusedIndex(
            focusedIndex === 0 ? items.length - 1 : focusedIndex - 1
          );
          break;
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
        case event.key === 'Enter' && !showInput: {
          const item = items[focusedIndex];
          if (item) {
            onExecute(item.item);
          }
          break;
        }
        case event.key === 'Escape':
          setOpen(false);
      }
    },
    [
      open,
      addOption,
      inputValue,
      items,
      focusedIndex,
      showInput,
      setOpen,
      onExecute,
    ]
  );

  useWindowListener('keydown', onKeyDown);

  useEffect(() => {
    if (showInput && open) {
      ref.current?.focus();
    }
  }, [showInput, open]);

  useEffect(() => {
    if (error && !items.some((i) => i.item === inputValue)) {
      setError(false);
    }
  }, [error, inputValue, items]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger css={{ width: '100%' }}>{children}</Popover.Trigger>
      <Popover.Content>
        <div css={styles}>
          <div css={mainStyles}>
            {otherItems.length > 0 &&
              otherItems.map((group) => (
                <DropdownMenuGroup
                  key={nanoid()}
                  items={group.items}
                  onExecute={onExecute}
                  title={group.title}
                  onEditOption={onEditOption}
                  onRemoveOption={onRemoveOption}
                />
              ))}
            {items.length > 0 && (
              <DropdownMenuGroup
                key={nanoid()}
                items={items}
                onExecute={onExecute}
                onEditOption={onEditOption}
                onRemoveOption={onRemoveOption}
                isEditingAllowed={!isReadOnly}
              />
            )}
            {!isReadOnly && showInput && (
              <DropdownOption
                value={inputValue}
                setValue={setInputValue}
                error={error}
              />
            )}
          </div>

          {!isReadOnly && (
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
