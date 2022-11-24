import { useCallback, useState } from 'react';
import {
  ELEMENT_DROPDOWN,
  PlateComponent,
  useTPlateEditorRef,
} from '@decipad/editor-types';
import { useElementMutatorCallback, useNodePath } from '@decipad/editor-utils';
import { DropdownMenu, SelectItems, WidgetDisplay } from '@decipad/ui';
import { getNodeString, insertText } from '@udecode/plate';
import { useIsEditorReadOnly } from '@decipad/react-contexts';

export const Dropdown: PlateComponent = ({ attributes, element, children }) => {
  if (element?.type !== ELEMENT_DROPDOWN) {
    throw new Error('Dropdown is meant to render dropdown element');
  }
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selected = getNodeString(element);
  const dropdownIds: SelectItems[] = element.options.map((n) => ({
    item: n,
    focused: selected === n,
    editing: false,
  }));

  const editor = useTPlateEditorRef();
  const path = useNodePath(element);
  const readOnly = useIsEditorReadOnly();

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

  const editOption = useCallback(
    (old: string, newV: string) => {
      const newOps = element.options.map((e) => {
        if (e === old) {
          return newV;
        }
        return e;
      });
      elementChangeOptions(newOps);
    },
    [element.options, elementChangeOptions]
  );

  const onExecute = useCallback(
    (item: string) => {
      changeOptions(item);
      setDropdownOpen(false);
    },
    [changeOptions]
  );

  return (
    <div {...attributes} contentEditable={false} id={element.id}>
      <WidgetDisplay
        allowOpen={true}
        openMenu={dropdownOpen}
        setOpenMenu={setDropdownOpen}
        readOnly={readOnly}
      >
        {children}
      </WidgetDisplay>
      <DropdownMenu
        open={dropdownOpen}
        isReadOnly={readOnly}
        items={dropdownIds}
        addOption={addOption}
        removeOption={removeOption}
        editOptions={editOption}
        onExecute={onExecute}
        dropdownOpen={setDropdownOpen}
      />
    </div>
  );
};
