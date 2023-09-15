import { useComputer } from '@decipad/react-contexts';
import { useResolved } from '@decipad/react-utils';
import { useMemo } from 'react';
import { materializeResult } from '@decipad/computer';

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
