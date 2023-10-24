import {
  TableHeaderElement,
  ELEMENT_VARIABLE_DEF,
  useTEditorRef,
} from '@decipad/editor-types';
import { useEffect, useMemo } from 'react';
import { usePathMutatorCallback } from '@decipad/editor-hooks';
import type { Path } from 'slate';
import { useElements } from '@decipad/editor-components';

export const useTableHeaderCellDropdownNames = (
  element: TableHeaderElement,
  path?: Path
) => {
  const editor = useTEditorRef();

  const dropdownElements = useElements(
    ELEMENT_VARIABLE_DEF,
    (el) => el.variant === 'dropdown'
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
    if (element.cellType.kind === 'dropdown') {
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
