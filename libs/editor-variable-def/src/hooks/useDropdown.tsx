import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { combineLatestWith, concat, distinctUntilChanged, map, of } from 'rxjs';
import { ColumnDesc, materializeColumnDesc } from '@decipad/computer';
import {
  EditorChangeContext,
  useComputer,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { DropdownElement, useTPlateEditorRef } from '@decipad/editor-types';
import { SelectItems, icons } from '@decipad/ui';
import { getNodeString, insertText, nanoid } from '@udecode/plate';
import { usePathMutatorCallback, useNodePath } from '@decipad/editor-hooks';
import { ClientEventsContext } from '@decipad/client-events';
import { formatResultPreview } from '@decipad/format';
import { useResolved } from '@decipad/react-utils';
import { dequal } from '@decipad/utils';

interface UseDropdownResult {
  dropdownOpen: boolean;
  setDropdownOpen: (newOpen: boolean) => void;
  dropdownIds: Array<SelectItems>;
  addOption: (newOption: string) => void;
  removeOption: (option: SelectItems) => void;
  editOption: (option: SelectItems, newText: string) => boolean;
  execute: (option: SelectItems) => void;
}

export const useDropdown = (element: DropdownElement): UseDropdownResult => {
  const editor = useTPlateEditorRef();
  const computer = useComputer();
  const editorChanges = useContext(EditorChangeContext);
  const path = useNodePath(element);
  const readOnly = useIsEditorReadOnly();
  const userEvents = useContext(ClientEventsContext);

  const selected = getNodeString(element);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownIds: Array<SelectItems> = useMemo(
    () =>
      element.options.map((n) => ({
        item: n.value,
        focused: n.value === selected,
      })),
    [element, selected]
  );

  const elementChangeOptions = usePathMutatorCallback(editor, path, 'options');

  const addOption = useCallback(
    (newOption: string) => {
      elementChangeOptions([
        ...element.options,
        {
          id: nanoid(),
          value: newOption,
        },
      ]);
    },
    [element.options, elementChangeOptions]
  );

  const changeOptions = useCallback(
    (newOption: string) => {
      insertText(editor, newOption, {
        at: path,
      });
    },
    [editor, path]
  );

  const removeOption = useCallback(
    (option: SelectItems) => {
      elementChangeOptions(
        element.options.filter((n) => n.value !== option.item)
      );
      if (option.item === selected) {
        insertText(editor, 'Select', {
          at: path,
        });
      }
    },
    [element.options, elementChangeOptions, editor, path, selected]
  );

  const elementChangeColumn = usePathMutatorCallback(
    editor,
    path,
    'selectedColumn'
  );

  // Return true when the option was changes, false when it wasn't
  const editOption = useCallback(
    (option: SelectItems, newText: string): boolean => {
      if (option.item === newText) return true;
      const exists = element.options.some((v) => v.value === newText);

      // If there already exists an option, we don't want duplicates.
      if (exists) return false;

      const newOps = element.options.map((e) => {
        if (e.value === option.item) {
          return { id: e.id, value: newText };
        }
        return e;
      });

      if (option.item === selected) {
        changeOptions(option.item);
      }
      elementChangeOptions(newOps);
      return true;
    },
    [element.options, elementChangeOptions, changeOptions, selected]
  );

  const execute = useCallback(
    (option: SelectItems) => {
      if (option.type === 'column') {
        elementChangeColumn(
          element.selectedColumn === option.item ? undefined : option.item
        );
      } else {
        if (selected === option.item) {
          changeOptions('Select');
        } else {
          changeOptions(option.item);
        }
        userEvents({
          type: 'action',
          action: 'widget value updated',
          props: {
            variant: 'dropdown',
            isReadOnly: readOnly,
          },
        });
        setDropdownOpen(false);
      }
    },
    [
      changeOptions,
      selected,
      elementChangeColumn,
      element.selectedColumn,
      userEvents,
      readOnly,
    ]
  );

  const [columns, setColumns] = useState<ColumnDesc[]>([]);

  useEffect(() => {
    if (!dropdownOpen || !element.smartSelection) {
      setColumns([]);
      return;
    }

    const editorChanges$ = concat(of(undefined), editorChanges);
    const allColumn$ = concat(of([]), computer.getAllColumns$.observe());

    const sub = editorChanges$
      .pipe(
        combineLatestWith(allColumn$),
        map(([, c]) => c),
        distinctUntilChanged((cur, next) => dequal(cur, next))
      )
      .subscribe(setColumns);

    return () => {
      sub.unsubscribe();
    };
  }, [
    computer.getAllColumns$,
    editorChanges,
    dropdownOpen,
    element.smartSelection,
  ]);

  // materialize columns
  const materializedColumnsP = useMemo(
    () => Promise.all(columns.map(materializeColumnDesc)),
    [columns]
  );
  const materializedColumns = useResolved(materializedColumnsP);

  const otherItems = useMemo((): SelectItems[] => {
    if (!materializedColumns) {
      return [];
    }
    const colValues = materializedColumns.find((c) =>
      c.blockId
        ? c.blockId === element.selectedColumn
        : `${c.tableName}.${c.columnName}` === element.selectedColumn
    );
    return [
      ...materializedColumns.map((c) => ({
        group: 'Table category',
        item: `${c.tableName}.${c.columnName}`,
        blockId: c.blockId,
        type: 'column',
        focused: element.selectedColumn === c.columnName,
        icon: <icons.Table />,
      })),
      ...(colValues
        ? [
            ...colValues.result.value.map((v) => ({
              group: 'Values',
              item: formatResultPreview({
                value: v,
                type: colValues.result.type.cellType,
              }),
            })),
          ]
        : []),
    ];
  }, [element.selectedColumn, materializedColumns]);

  return useMemo(
    () => ({
      dropdownOpen,
      setDropdownOpen,
      dropdownIds: [...dropdownIds, ...otherItems],
      otherItems,
      addOption,
      removeOption,
      editOption,
      execute,
    }),
    [
      addOption,
      dropdownIds,
      dropdownOpen,
      editOption,
      execute,
      otherItems,
      removeOption,
    ]
  );
};
