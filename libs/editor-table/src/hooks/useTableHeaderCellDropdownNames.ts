import {
  TableHeaderElement,
  ELEMENT_VARIABLE_DEF,
  useMyEditorRef,
} from '@decipad/editor-types';
import { useCallback, useEffect, useMemo } from 'react';
import { usePathMutatorCallback, useElements } from '@decipad/editor-hooks';
import type { Path } from 'slate';

export const useTableHeaderCellDropdownNames = (
  element: TableHeaderElement,
  path?: Path
) => {
  const editor = useMyEditorRef();

  const dropdownElements = useElements(
    ELEMENT_VARIABLE_DEF,
    useCallback((el) => el.variant === 'dropdown', [])
  );

  const dropdownNames = useMemo(
    () =>
      dropdownElements.map((el) => ({
        id: el.id,
        value: el.children[0].children[0].text,
        type:
          el.coerceToType?.kind === 'string'
            ? ('string' as const)
            : ('number' as const),
      })),
    [dropdownElements]
  );

  const mutateDropdownType = usePathMutatorCallback(
    editor,
    path,
    'cellType',
    'useTableHeaderCellDropdownNames'
  );
  useEffect(() => {
    if (element?.cellType?.kind === 'dropdown') {
      const selectedDropdown = dropdownNames.find((d) => {
        if (element.cellType.kind === 'dropdown') {
          return element.cellType.id === d.id;
        }
        return undefined;
      });
      if (
        selectedDropdown?.type !== element.cellType.type &&
        selectedDropdown
      ) {
        mutateDropdownType({
          kind: 'dropdown',
          id: selectedDropdown.id,
          type: selectedDropdown.type,
        });
      }
    }
  }, [dropdownNames, element.cellType, mutateDropdownType]);

  return dropdownNames;
};
