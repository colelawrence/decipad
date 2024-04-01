import {
  ColumnMenuDropdown,
  ELEMENT_VARIABLE_DEF,
  TableHeaderElement,
  VariableDropdownElement,
  useMyEditorRef,
} from '@decipad/editor-types';
import { useCallback, useEffect } from 'react';
import {
  useGlobalFindNode,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import type { Path } from 'slate';
import { useCategoriesNames } from '@decipad/react-contexts';
import { TNode, getNodeString } from '@udecode/plate-common';
import { assertElementType } from '@decipad/editor-utils';
import { useDeepMemo } from '@decipad/react-utils';

function FilterForDropdowns(
  el: TNode | undefined
): el is VariableDropdownElement {
  if (el == null) {
    return false;
  }

  if (el.type !== ELEMENT_VARIABLE_DEF) {
    return false;
  }

  assertElementType(el, ELEMENT_VARIABLE_DEF);

  return el.variant === 'dropdown';
}

export const useTableHeaderCellDropdownNames = (
  element: TableHeaderElement,
  path?: Path
): Array<ColumnMenuDropdown> => {
  const editor = useMyEditorRef();

  const categories = useCategoriesNames();
  const globalFindNode = useGlobalFindNode();

  const dropdownNames: Array<ColumnMenuDropdown> = useDeepMemo(
    useCallback(() => {
      if (globalFindNode == null) {
        return [];
      }

      return categories
        .map((c) => globalFindNode((el) => el.id === c))
        .filter(FilterForDropdowns)
        .map(
          (el): ColumnMenuDropdown => ({
            id: el.id,
            value: getNodeString(el.children[0]),
            type: (el.children[1].variant as 'string' | 'number') ?? 'string',
          })
        );
    }, [categories, globalFindNode])
  );

  const mutateDropdownType = usePathMutatorCallback(
    editor,
    path,
    'cellType',
    'useTableHeaderCellDropdownNames'
  );

  useEffect(() => {
    if (element?.cellType?.kind === 'dropdown') {
      const selectedDropdown = dropdownNames.find((dropdown) => {
        if (element.cellType.kind === 'dropdown') {
          return element.cellType.id === dropdown.id;
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
