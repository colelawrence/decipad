/* eslint decipad/css-prop-named-variable: 0 */
import type { CellProps } from './types';
import { assertCellType } from './assertCellType';
import { DropdownMenu, SelectItems } from '../../../shared';
import { CodeResult } from '../CodeResult/CodeResult';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDropdownConsumer } from '@decipad/editor-hooks';
import { Caret } from '../../../icons';
import { focusEditor, useEditorRef } from '@udecode/plate-common';

export const CellEditorDropdown = (cellProps: CellProps) => {
  const { cellType, onChange, value } = cellProps;
  assertCellType(cellType!, 'dropdown');

  const editor = useEditorRef();
  const dropdownOptions = useDropdownConsumer({ blockId: value, cellType });

  const [open, setOpen] = useState(false);
  const wasOpenRef = useRef(open);

  const groups: Array<SelectItems> = useMemo(
    () =>
      dropdownOptions?.options.map((option) => ({
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
        groups={groups}
      >
        <div css={{ display: 'flex', alignItems: 'center' }}>
          {dropdownOptions?.result && (
            <CodeResult
              value={dropdownOptions.result.value}
              type={dropdownOptions.result.type}
            />
          )}
          <div css={{ width: 16, height: 16, marginLeft: 'auto' }}>
            <Caret variant={open ? 'up' : 'down'} />
          </div>
        </div>
      </DropdownMenu>
    </div>
  );
};
