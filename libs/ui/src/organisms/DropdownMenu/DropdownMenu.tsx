import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { SelectItem, SelectItems } from '../../atoms';
import { Plus } from '../../icons';
import { DropdownOption } from '../../molecules';
import { cssVar, mediumShadow, p13Medium, setCssVar } from '../../primitives';

const styles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  overflowX: 'hidden',
  top: '50px',
  left: 0,
  userSelect: 'none',

  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '12px',
  boxShadow: `0px 3px 24px -4px ${mediumShadow.rgba}`,
  position: 'absolute',
  width: '100%',
  maxWidth: '244px',
  boxSizing: 'border-box',
  zIndex: 3,
});

const mainStyles = css({
  padding: '6px',
  marginTop: '2px',
  marginBottom: '2px',
  width: '100%',
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

interface DropdownMenuProps {
  readonly open: boolean;
  readonly isReadOnly: boolean;
  readonly items: Array<SelectItems>;
  readonly addOption: (a: string) => void;
  readonly removeOption: (a: string) => void;
  readonly editOptions: (a: string, b: string) => void;
  readonly onExecute: (a: string) => void;
  readonly dropdownOpen: (b: boolean) => void;
}

export const DropdownMenu: FC<DropdownMenuProps> = ({
  open,
  isReadOnly,
  items,
  addOption,
  removeOption,
  editOptions,
  onExecute,
  dropdownOpen,
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
        case event.key === 'Enter' && !showInput:
          onExecute(items[focusedIndex].item);
          break;
        case event.key === 'Escape':
          dropdownOpen(false);
      }
    },
    [
      addOption,
      inputValue,
      items,
      focusedIndex,
      showInput,
      dropdownOpen,
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

  if (!open) return null;

  return (
    <div css={[styles, !open && { display: 'none' }]}>
      <div
        css={[
          mainStyles,
          items.length > 5 && {
            height: '200px',
            overflowY: 'scroll',
          },
        ]}
      >
        {items.map((item, index) => (
          <SelectItem
            key={item.item}
            item={item}
            focused={!addingNew && index === focusedIndex}
            onSelect={onExecute}
            removeOption={removeOption}
            editOption={editOptions}
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
  );
};
