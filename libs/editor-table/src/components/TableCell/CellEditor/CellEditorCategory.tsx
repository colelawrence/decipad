import type { CellProps } from './types';
import { assertCellType } from './assertCellType';
import { useState, useEffect, useCallback } from 'react';
import { DropdownMenu, CodeResult } from '@decipad/ui';
import type { FC } from 'react';
import type { SelectItems } from '@decipad/ui';
import { getNode, setNodes } from '@udecode/plate-common';
import type { TableHeaderElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { CaretDown, CaretUp } from 'libs/ui/src/icons';
import { useComputer } from '@decipad/editor-hooks';

const outterCellStyles = css({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
});

const caretStyles = css({ width: 16, height: 16, marginLeft: 'auto' });

export const CellEditorCategory: FC<CellProps> = (cellProps) => {
  const { cellType, path, value, onChange } = cellProps;
  assertCellType(cellType!, 'category');

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<SelectItems>>([]);

  const editor = useMyEditorRef();
  const computer = useComputer();

  const getCategories = useCallback(() => {
    const header = getNode<TableHeaderElement>(editor, [path[0], 1, path[2]]);
    return header?.categoryValues ? Array.from(header.categoryValues) : [];
  }, [editor, path]);

  const addCategory = (category: string) => {
    const categoryValues = getCategories();
    categoryValues.push({ id: nanoid(), value: category });
    const header = getNode(editor, [path[0], 1, path[2]]) as TableHeaderElement;
    setNodes(
      editor,
      { ...header, categoryValues },
      {
        at: [path[0], 1, path[2]],
      }
    );
  };

  const removeCategory = (id: string) => {
    const categoryValues = getCategories();
    const header = getNode(editor, [path[0], 1, path[2]]) as TableHeaderElement;
    setNodes(
      editor,
      { ...header, categoryValues: categoryValues.filter((c) => c.id !== id) },
      {
        at: [path[0], 1, path[2]],
      }
    );
  };

  const editCategory = (id: string, newValue: string) => {
    const categoryValues = getCategories();
    const index = categoryValues.findIndex((c) => c.id === id);
    if (index < 0) return false;
    categoryValues[index] = { id, value: newValue };
    const header = getNode(editor, [path[0], 1, path[2]]) as TableHeaderElement;
    setNodes(
      editor,
      { ...header, categoryValues },
      {
        at: [path[0], 1, path[2]],
      }
    );
    return true;
  };

  const updateList = useCallback(() => {
    const categories = getCategories();
    if (categories) {
      setItems(
        categories.map((e) => ({
          id: e.id,
          item: e.value,
          blockId: e.id,
        }))
      );
    }
  }, [getCategories]);

  useEffect(() => {
    updateList();
  }, [updateList, open]);

  const isReadOnly = useIsEditorReadOnly();
  const result = computer.getBlockIdResult(value)?.result;
  return (
    <div>
      <DropdownMenu
        open={open}
        setOpen={setOpen}
        onExecute={(o) => {
          if (o.blockId) onChange?.(o.blockId);
          setOpen(false);
        }}
        addOption={(o) => {
          addCategory(o);
          updateList();
        }}
        onEditOption={(o, n) => {
          if (!o.blockId) return false;
          const val = editCategory(o.blockId, n);
          updateList();
          return val;
        }}
        onRemoveOption={(o) => {
          if (o.blockId) removeCategory(o.blockId);
          updateList();
        }}
        items={items}
        isEditingAllowed={!isReadOnly}
      >
        <div css={outterCellStyles}>
          {result != null && (
            <CodeResult
              value={result.value}
              type={result.type}
              meta={result.meta}
            />
          )}
          <div css={caretStyles}>{open ? <CaretUp /> : <CaretDown />}</div>
        </div>
      </DropdownMenu>
    </div>
  );
};
