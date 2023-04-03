import { ClientEventsContext } from '@decipad/client-events';
import { ColumnDesc } from '@decipad/computer';
import {
  ELEMENT_DROPDOWN,
  PlateComponent,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useElementMutatorCallback,
  useNodePath,
} from '@decipad/editor-utils';
import { formatResultPreview } from '@decipad/format';
import {
  EditorChangeContext,
  useComputer,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { DropdownMenu, SelectItems, WidgetDisplay } from '@decipad/ui';
import { getNodeString, insertText, nanoid } from '@udecode/plate';
import { dequal } from 'dequal';
import { Table } from 'libs/ui/src/icons';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { combineLatestWith, concat, distinctUntilChanged, map, of } from 'rxjs';

export const Dropdown: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_DROPDOWN);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [columns, setColumns] = useState<ColumnDesc[]>([]);

  const selected = getNodeString(element);
  const computer = useComputer();

  const editorChanges = useContext(EditorChangeContext);

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

  const dropdownIds: Array<SelectItems> = useMemo(
    () =>
      element.options.map((n) => ({
        item: n.value,
        focused: n.value === selected,
      })),
    [element, selected]
  );

  const editor = useTPlateEditorRef();
  const path = useNodePath(element);
  const readOnly = useIsEditorReadOnly();
  const userEvents = useContext(ClientEventsContext);

  // For the dropdown options to be permenant in the editor state,
  // I save to a field in the dropdown child, this array can be
  // modifiedwith this functions
  const elementChangeOptions = useElementMutatorCallback(
    editor,
    element,
    'options'
  );

  const elementChangeColumn = useElementMutatorCallback(
    editor,
    element,
    'selectedColumn'
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
      if (option.item === selected) {
        insertText(editor, 'Select', {
          at: path,
        });
      }
    },
    [element.options, elementChangeOptions, editor, path, selected]
  );

  // Return true when the option was changes, false when it wasn't
  const onEditOption = useCallback(
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

  const onExecute = useCallback(
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

  const otherItems = useMemo(() => {
    const colValues = columns.find((c) =>
      c.blockId
        ? c.blockId === element.selectedColumn
        : `${c.tableName}.${c.columnName}` === element.selectedColumn
    );
    return [
      ...columns.map((c) => ({
        group: 'Table category',
        item: `${c.tableName}.${c.columnName}`,
        blockId: c.blockId,
        type: 'column',
        focused: element.selectedColumn === c.columnName,
        icon: <Table />,
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
  }, [columns, element.selectedColumn]);

  return (
    <div
      {...attributes}
      contentEditable={false}
      id={element.id}
      aria-roledescription="dropdown-open"
    >
      <DropdownMenu
        open={dropdownOpen}
        setOpen={setDropdownOpen}
        isReadOnly={readOnly}
        groups={[...dropdownIds, ...otherItems]}
        addOption={addOption}
        onRemoveOption={removeOption}
        onEditOption={onEditOption}
        onExecute={onExecute}
        isEditingAllowed
      >
        <WidgetDisplay
          openMenu={dropdownOpen}
          setOpenMenu={setDropdownOpen}
          readOnly={readOnly}
          allowOpen
        >
          {children}
        </WidgetDisplay>
      </DropdownMenu>
    </div>
  );
};
