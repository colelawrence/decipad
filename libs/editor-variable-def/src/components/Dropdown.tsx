import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ELEMENT_DROPDOWN,
  PlateComponent,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { useElementMutatorCallback, useNodePath } from '@decipad/editor-utils';
import {
  DropdownMenu,
  SelectItems,
  SelectItemTypes,
  WidgetDisplay,
} from '@decipad/ui';
import { getNodeString, insertText } from '@udecode/plate';
import {
  EditorChangeContext,
  useComputer,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { formatResultPreview } from '@decipad/format';
import { Table } from 'libs/ui/src/icons';
import { concat, of, combineLatestWith, map, distinctUntilChanged } from 'rxjs';
import { dequal } from 'dequal';
import { Result, SerializedType } from '@decipad/computer';

export const Dropdown: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_DROPDOWN) {
    throw new Error('Dropdown is meant to render dropdown element');
  }

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  const [columns, setColumns] = useState<
    Array<{
      name: string;
      colValues: Result.OneResult[];
      type: SerializedType;
    }>
  >([]);

  const selected = getNodeString(element);
  const computer = useComputer();

  const editorChanges = useContext(EditorChangeContext);

  useEffect(() => {
    const editorChanges$ = concat(of(undefined), editorChanges);
    const sub = editorChanges$
      .pipe(
        combineLatestWith(
          concat(
            of(undefined),
            computer.getAllColumns$.observeWithSelector((cols) => {
              if (!dropdownOpen || !element.smartSelection) return [];
              // STUB: Computer getAllColumns returns duplicates. There is a fix inbound.
              return cols.filter(
                (c, pos) => cols.findIndex((i) => c.name === i.name) === pos
              );
            })
          )
        ),
        map(([, c]) => Array.isArray(c) && c),
        distinctUntilChanged(dequal)
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

  const dropdownIds: SelectItems[] = useMemo(
    () =>
      element.options.map((n) => ({
        item: n,
        focused: n === selected,
      })),
    [element.options, selected]
  );

  const editor = useTPlateEditorRef();
  const path = useNodePath(element);
  const readOnly = useIsEditorReadOnly();

  // For the dropdown options to be permenant in the editor state,
  // I save to a field in the dropdown child, this array can be
  // modifiedwith this functions
  const elementChangeOptions = useElementMutatorCallback(
    editor,
    element,
    'options'
  );

  const addOption = useCallback(
    (newOption: string) => {
      elementChangeOptions([...element.options, newOption]);
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
    (removeOptionn: string) => {
      elementChangeOptions(element.options.filter((n) => n !== removeOptionn));
      if (removeOptionn === selected) {
        insertText(editor, 'Select', {
          at: path,
        });
      }
    },
    [element.options, elementChangeOptions, editor, path, selected]
  );

  // Return true when the option was changes, false when it wasn't
  const onEditOption = useCallback(
    (old: string, newV: string): boolean => {
      if (old === newV) return true;
      const exists = element.options.some((v) => v === newV);

      // If there already exists an option, we don't want duplicates.
      if (exists) return false;

      const newOps = element.options.map((e) => {
        if (e === old) {
          return newV;
        }
        return e;
      });

      if (old === selected) {
        changeOptions(newV);
      }
      elementChangeOptions(newOps);
      return true;
    },
    [element.options, elementChangeOptions, changeOptions, selected]
  );

  const onExecute = useCallback(
    (item: string, type?: SelectItemTypes) => {
      if (type === 'column') {
        if (selectedCol === item) {
          setSelectedCol(null);
        } else {
          setSelectedCol(item);
        }
      } else {
        if (selected === item) {
          changeOptions('Select');
        } else {
          changeOptions(item);
        }
        setDropdownOpen(false);
      }
    },
    [changeOptions, selected, selectedCol]
  );

  const otherItems = useMemo(() => {
    const colValues = columns.find((c) => c.name === selectedCol);
    return [
      {
        title: 'Table category',
        items: columns.map((c) => ({
          item: c.name,
          type: 'column',
          focused: selectedCol === c.name,
          icon: <Table />,
        })),
      },
      ...(colValues
        ? [
            {
              title: 'Values',
              items: colValues.colValues.map((v) => ({
                item: formatResultPreview({
                  value: v,
                  type: colValues.type,
                }),
              })),
            },
          ]
        : []),
    ];
  }, [columns, selectedCol]);

  return (
    <div {...attributes} contentEditable={false} id={element.id}>
      <DropdownMenu
        open={dropdownOpen}
        setOpen={setDropdownOpen}
        isReadOnly={readOnly}
        items={!element.smartSelection ? dropdownIds : []}
        otherItems={element.smartSelection ? otherItems : []}
        addOption={addOption}
        onRemoveOption={removeOption}
        onEditOption={onEditOption}
        onExecute={onExecute}
      >
        <WidgetDisplay
          allowOpen={true}
          openMenu={dropdownOpen}
          setOpenMenu={setDropdownOpen}
          readOnly={readOnly}
        >
          {children}
        </WidgetDisplay>
      </DropdownMenu>
    </div>
  );
};
