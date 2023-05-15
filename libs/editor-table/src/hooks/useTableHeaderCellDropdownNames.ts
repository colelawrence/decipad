import {
  TableHeaderElement,
  ELEMENT_VARIABLE_DEF,
  useTEditorRef,
} from '@decipad/editor-types';
import { useCallback, useEffect } from 'react';
import { useEditorChange, usePathMutatorCallback } from '@decipad/editor-hooks';
import { assertElementType } from '@decipad/editor-utils';
import type { Path } from 'slate';

export const useTableHeaderCellDropdownNames = (
  element: TableHeaderElement,
  path?: Path
) => {
  const editor = useTEditorRef();

  const dropDownNames = useEditorChange(
    useCallback(() => {
      return editor.children
        .filter(
          (c) => c.type === ELEMENT_VARIABLE_DEF && c.variant === 'dropdown'
        )
        .map((d) => {
          assertElementType(d, ELEMENT_VARIABLE_DEF);
          return {
            id: d.id,
            value: d.children[0].children[0].text,
            type:
              d.coerceToType?.kind === 'string'
                ? ('string' as const)
                : ('number' as const),
          };
        });
    }, [editor.children])
  );

  const mutateDropdownType = usePathMutatorCallback(editor, path, 'cellType');
  useEffect(() => {
    if (element.cellType.kind === 'dropdown') {
      const selectedDropdown = dropDownNames.find((d) => {
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
  }, [dropDownNames, element.cellType, mutateDropdownType]);

  return dropDownNames;
};
