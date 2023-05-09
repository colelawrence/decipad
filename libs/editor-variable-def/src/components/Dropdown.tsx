import { ELEMENT_DROPDOWN, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { DropdownMenu, WidgetDisplay } from '@decipad/ui';
import { useDropdown } from '../hooks/useDropdown';

export const Dropdown: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_DROPDOWN);

  const readOnly = useIsEditorReadOnly();

  const {
    dropdownOpen,
    setDropdownOpen,
    dropdownIds,
    addOption,
    removeOption,
    editOption,
    execute,
  } = useDropdown(element);

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
        groups={dropdownIds}
        addOption={addOption}
        onRemoveOption={removeOption}
        onEditOption={editOption}
        onExecute={execute}
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
