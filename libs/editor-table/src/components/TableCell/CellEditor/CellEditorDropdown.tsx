import type { CellProps } from './types';
import { assertCellType } from './assertCellType';
import { DropdownMenu, CodeResult } from '@decipad/ui';
import type { SelectItems } from '@decipad/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropdownConsumer } from '@decipad/editor-hooks';
import { focusEditor, useEditorRef } from '@udecode/plate-common';
import { CaretDown, CaretUp } from 'libs/ui/src/icons';

export const CellEditorDropdown = (cellProps: CellProps) => {
  const { cellType, onChange, value } = cellProps;
  assertCellType(cellType!, 'dropdown');

  const editor = useEditorRef();
  const dropdownOptions = useDropdownConsumer({ blockId: value, cellType });

  const [open, setOpen] = useState(false);
  const wasOpenRef = useRef(open);

  const items: Array<SelectItems> = useMemo(
    () =>
      dropdownOptions?.options.map((option) => ({
        id: option.id,
        item: option.id,
        itemName: option.value,
      })) ?? [],
    [dropdownOptions?.options]
  );

  /**
   * TODO: Uncomment this code to enable opening the dropdown using
   * space/enter, but only after DropdownMenu is made keyboard accessible.
   */
  // const onKeyDown = useCallback(
  //   (event: KeyboardEvent) => {
  //     if (isHotkey(['space', 'enter'], event)) {
  //       setOpen(true);
  //     }
  //   },
  //   [setOpen]
  // );
  // useCellDOMEvents(eventTarget, { onKeyDown });

  useEffect(() => {
    if (wasOpenRef.current && !open) {
      focusEditor(editor);
    }

    wasOpenRef.current = open;
  }, [open, editor]);

  return (
    <div data-testid="dropdown-editor">
      <DropdownMenu
        open={open}
        setOpen={setOpen}
        onExecute={(i) => {
          onChange?.(i.item);
          setOpen(false);
        }}
        items={items}
      >
        <div css={{ display: 'flex', alignItems: 'center' }}>
          {dropdownOptions?.result && (
            <CodeResult
              value={dropdownOptions.result.value}
              type={dropdownOptions.result.type}
              meta={dropdownOptions.result.meta}
            />
          )}
          <div css={{ width: 16, height: 16, marginLeft: 'auto' }}>
            {open ? <CaretUp /> : <CaretDown />}
          </div>
        </div>
      </DropdownMenu>
    </div>
  );
};
