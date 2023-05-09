import { Result, getExprRef, materializeResult } from '@decipad/computer';
import {
  ELEMENT_VARIABLE_DEF,
  CellValueType,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { useMemo } from 'react';
import { useResolved } from '@decipad/react-utils';
import { DropdownOption } from '../types';

interface UseDropDownConsumerProps {
  varName: string;
  cellType: CellValueType | undefined;
}

interface UseDropDownConsumerResults {
  dropdownResult: Result.Result | undefined;
  dropdownOptions: DropdownOption[];
}

export const useDropdownConsumer = ({
  varName,
  cellType,
}: UseDropDownConsumerProps): UseDropDownConsumerResults => {
  const computer = useComputer();
  const editor = useTEditorRef();

  const dropdownResult = computer.getVarResult$.use(varName)?.result;
  const materializedDropdownResult = useResolved(
    useMemo(
      () =>
        dropdownResult != null ? materializeResult(dropdownResult) : undefined,
      [dropdownResult]
    )
  );
  const dropdownOptions: DropdownOption[] = useMemo(() => {
    if (!cellType || cellType.kind !== 'dropdown') return [];

    const dropdown = editor.children.find((child) => child.id === cellType.id);
    if (!dropdown) {
      return [];
    }
    assertElementType(dropdown, ELEMENT_VARIABLE_DEF);
    if (dropdown.variant !== 'dropdown') return [];
    const { options } = dropdown.children[1];

    return options.map((o) => ({
      ...o,
      focused: varName === getExprRef(o.id),
    }));
  }, [cellType, editor.children, varName]);

  return useMemo(
    () => ({
      dropdownResult: materializedDropdownResult,
      dropdownOptions,
    }),
    [dropdownOptions, materializedDropdownResult]
  );
};
