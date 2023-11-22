import { ClientEventsContext } from '@decipad/client-events';
import { ColumnDesc, materializeColumnDesc } from '@decipad/computer';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import { DropdownElement, useTPlateEditorRef } from '@decipad/editor-types';
import { formatResultPreview } from '@decipad/format';
import {
  EditorChangeContext,
  useComputer,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { useResolved } from '@decipad/react-utils';
import { SelectItems, icons } from '@decipad/ui';
import { dequal } from '@decipad/utils';
import { insertText, nanoid } from '@udecode/plate-common';
import { MaterializedColumnDesc } from 'libs/computer/src/types';
import uniqBy from 'lodash.uniqby';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { combineLatestWith, concat, distinctUntilChanged, map, of } from 'rxjs';

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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectItems>({
    blockId: '',
    item: 'Selected',
  });
  const dropdownIds: Array<SelectItems> = useMemo(
    () =>
      element.options.map((n) => ({
        item: n.value,
        blockId: n.id,
        focused: n.value === selectedOption.item,
      })),
    [element, selectedOption]
  );

  const elementChangeOptions = usePathMutatorCallback(
    editor,
    path,
    'options',
    'useDropdown'
  );

  const onChangeTypeMutator = usePathMutatorCallback(
    editor,
    path?.slice(0, 1), // the parent (VariableDef)
    'coerceToType',
    'VariableDef'
  );

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
      if (option.blockId === selectedOption.blockId) {
        insertText(editor, 'Select', {
          at: path,
        });
      }
    },
    [element.options, elementChangeOptions, editor, path, selectedOption]
  );

  const elementChangeColumn = usePathMutatorCallback(
    editor,
    path,
    'selectedColumn',
    'useDropdown'
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
      if (option.blockId === selectedOption.blockId) {
        setSelectedOption({ ...selectedOption, item: newText });
        changeOptions(newText);
      }
      elementChangeOptions(newOps);
      return true;
    },
    [element.options, elementChangeOptions, changeOptions, selectedOption]
  );

  const execute = useCallback(
    (option: SelectItems) => {
      if (option.type === 'column') {
        elementChangeColumn(
          element.selectedColumn === option.item ? undefined : option.item
        );
        onChangeTypeMutator(option.blockType);
      } else {
        if (selectedOption.blockId === option.blockId) {
          setSelectedOption({ item: 'Selected', blockId: '' });
          changeOptions('Select');
        } else {
          setSelectedOption(option);
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
      elementChangeColumn,
      element.selectedColumn,
      onChangeTypeMutator,
      selectedOption,
      userEvents,
      readOnly,
      changeOptions,
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
  const materializedColumns = useResolved(
    useMemo(() => Promise.all(columns.map(materializeColumnDesc)), [columns])
  );

  const otherItems = useMemo((): SelectItems[] => {
    if (!materializedColumns) {
      return [];
    }
    const colValues = materializedColumns.find(
      (c) => `${c.tableName}.${c.columnName}` === element.selectedColumn
    );

    return [
      ...materializedColumns
        .filter((c: MaterializedColumnDesc) =>
          element.selectedColumn
            ? element.selectedColumn === `${c.tableName}.${c.columnName}`
            : true
        )
        .map((c) => {
          const itemName = c.readableTableName
            ? `${c.readableTableName}.${c.columnName}`
            : `${c.tableName}.${c.columnName}`;
          return {
            group: 'Table column',
            item: `${c.tableName}.${c.columnName}`,
            itemName,
            blockType: c.result.type.cellType,
            type: 'column',
            focused:
              element.selectedColumn === `${c.tableName}.${c.columnName}`,
            icon: <icons.TableSmall />,
          };
        }),
      ...(colValues
        ? uniqBy(
            [
              ...colValues.result.value.map((v) => ({
                group: 'Values',
                item: formatResultPreview({
                  value: v,
                  type: colValues.result.type.cellType,
                }),
              })),
            ],
            'item'
          )
        : []),
    ];
  }, [element.selectedColumn, materializedColumns]);

  return {
    dropdownOpen,
    setDropdownOpen,
    dropdownIds: element.smartSelection ? otherItems : dropdownIds,
    addOption,
    removeOption,
    editOption,
    execute,
  };
};
