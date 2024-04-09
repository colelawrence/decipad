import type { CellProps } from './types';
import { assertCellType } from './assertCellType';
import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import type { SelectItems } from '@decipad/ui';
import { DropdownMenu, CodeResult, icons as Icons } from '@decipad/ui';

import { getNode, setNodes } from '@udecode/plate-common';
import type { TableHeaderElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { useComputer, useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';

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
  const [groups, setGroups] = useState<Array<SelectItems>>([]);

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
      setGroups(
        categories.map((e) => ({
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
  const result = computer.getBlockIdResult(value);
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
        groups={groups}
        isEditingAllowed={!isReadOnly}
      >
        <div css={outterCellStyles}>
          {result?.result != null && (
            <CodeResult value={result.result.value} type={result.result.type} />
          )}
          <div css={caretStyles}>
            <Icons.Caret variant={open ? 'up' : 'down'} />
          </div>
        </div>
      </DropdownMenu>
    </div>
  );
};
