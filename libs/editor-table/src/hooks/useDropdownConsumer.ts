import { Result } from '@decipad/computer';
import {
  ELEMENT_VARIABLE_DEF,
  CellValueType,
  VariableDropdownElement,
} from '@decipad/editor-types';
import { useCallback, useMemo } from 'react';
import { DropdownOption } from '../types';
import { useMaterializedDropdownResult } from './useMaterializedDropdownResult';
import { useElements } from '@decipad/editor-components';

interface UseDropDownConsumerProps {
  blockId: string | undefined;
  cellType: CellValueType | undefined;
}

interface UseDropDownConsumerResults {
  dropdownResult: Result.Result | undefined;
  dropdownOptions: DropdownOption[];
}

export const useDropdownConsumer = ({
  blockId,
  cellType,
}: UseDropDownConsumerProps): UseDropDownConsumerResults => {
  const materializedDropdownResult = useMaterializedDropdownResult(blockId);

  const dropdownElements = useElements(
    ELEMENT_VARIABLE_DEF,
    useCallback((el) => el.variant === 'dropdown', [])
  );

  const options = useMemo(() => {
    if (cellType?.kind !== 'dropdown') return [];

    const varDropdown = dropdownElements.find(
      (d) => d.variant === 'dropdown' && d.id === cellType.id
    ) as VariableDropdownElement;
    if (!varDropdown) return [];

    return varDropdown.children[1].options;
  }, [cellType, dropdownElements]);

  return {
    dropdownResult: materializedDropdownResult,
    dropdownOptions: options,
  };
};
