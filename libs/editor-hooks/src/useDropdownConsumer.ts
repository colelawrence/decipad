import type { Result } from '@decipad/language-interfaces';
import { materializeResult } from '@decipad/remote-computer';
import type { CellValueType } from '@decipad/editor-types';
import { useMemo } from 'react';
import { useCategories } from '@decipad/react-contexts';
import { useResolved } from '@decipad/react-utils';
import { useComputer } from './useComputer';

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

  const materializedDropdownResult: Result.Result | undefined = useResolved(
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
  return {
    result: useMaterializedDropdownResult(blockId),
    options: useCategories(
      cellType?.kind === 'dropdown' ? cellType?.id : undefined
    ),
  };
};
