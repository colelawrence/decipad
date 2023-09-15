import { Result } from '@decipad/computer';
import {
  ELEMENT_VARIABLE_DEF,
  CellValueType,
  useTEditorRef,
  VariableDropdownElement,
} from '@decipad/editor-types';
import { useCallback, useState } from 'react';
import { DropdownOption } from '../types';
import { useMaterializedDropdownResult } from './useMaterializedDropdownResult';
import {
  CallbackObserver,
  useElementObserver,
} from '@decipad/editor-components';

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
  const editor = useTEditorRef();

  const materializedDropdownResult = useMaterializedDropdownResult(blockId);

  const [dropdownOptions, setDropdownOptions] = useState<Array<DropdownOption>>(
    []
  );

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

    setDropdownOptions([...dropdown.children[1].options]);
  }, [cellType, editor]);

  useElementObserver(dropdownObserverCallback, editor, ELEMENT_VARIABLE_DEF);

  return {
    dropdownResult: materializedDropdownResult,
    dropdownOptions,
  };
};
