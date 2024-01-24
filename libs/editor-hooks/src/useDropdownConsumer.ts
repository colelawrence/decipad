import { materializeResult, Result } from '@decipad/computer';
import {
  CellValueType,
  ELEMENT_VARIABLE_DEF,
  useMyEditorRef,
  VariableDropdownElement,
} from '@decipad/editor-types';
import { useCallback, useMemo, useState } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { useResolved } from '@decipad/react-utils';
import { CallbackObserver, useElementObserver } from './ElementChange';

export interface DropdownOption {
  id: string;
  value: string;
}

interface UseDropDownConsumerProps {
  blockId: string | undefined;
  cellType: CellValueType | undefined;
}

export interface UseDropDownConsumerResults {
  result: Result.Result | undefined;
  options: DropdownOption[];
}

const DROPDOWN_RESULT_DEBOUNCE_MS = 10;

export const useMaterializedDropdownResult = (blockId: string | undefined) => {
  const computer = useComputer();

  const dropdownResult = computer.getBlockIdResult$.useWithSelectorDebounced(
    DROPDOWN_RESULT_DEBOUNCE_MS,
    (element) => (element ? element.result : undefined),
    blockId
  );

  const materializedDropdownResult = useResolved(
    useMemo(
      () =>
        dropdownResult && dropdownResult?.type.kind !== 'pending'
          ? materializeResult(dropdownResult)
          : undefined,
      [dropdownResult]
    )
  );

  return materializedDropdownResult;
};

export const useDropdownConsumer = ({
  blockId,
  cellType,
}: UseDropDownConsumerProps): UseDropDownConsumerResults => {
  const editor = useMyEditorRef();

  const materializedDropdownResult = useMaterializedDropdownResult(blockId);

  const [options, setOptions] = useState<Array<DropdownOption>>([]);

  const dropdownObserverCallback = useCallback<
    CallbackObserver<typeof ELEMENT_VARIABLE_DEF>
  >(() => {
    if (cellType?.kind !== 'dropdown') return;

    const dropdown = editor.children.find(
      (child): child is VariableDropdownElement => {
        return child.id === cellType.id;
      }
    );

    if (!dropdown) return;

    if (dropdown.variant !== 'dropdown') return;

    setOptions([...dropdown.children[1].options]);
  }, [cellType, editor]);

  useElementObserver(dropdownObserverCallback, ELEMENT_VARIABLE_DEF);

  return {
    result: materializedDropdownResult,
    options,
  };
};
