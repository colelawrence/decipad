import { IdentifiedError, IdentifiedResult, Result } from '@decipad/computer';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { CodeLine, CodeVariable } from '@decipad/ui';
import { Node } from 'slate';
import { useAutoConvertToSmartRef } from '@decipad/editor-components';
import { useTableColumnHeaderOfTableAbove } from '../../hooks';

const errorDebounceMs = 500;

export const TableColumnFormula: PlateComponent = ({ children, element }) => {
  assertElementType(element, ELEMENT_TABLE_COLUMN_FORMULA);
  const header = useTableColumnHeaderOfTableAbove(element, element.columnId);
  const errorResult = useComputer().getBlockIdResult$.useWithSelectorDebounced(
    errorDebounceMs,
    selectErrors,
    element.columnId
  );

  useAutoConvertToSmartRef(element);

  return (
    <CodeLine variant="table" result={errorResult} element={element}>
      <span contentEditable={false}>
        <CodeVariable type={{ kind: 'table-formula' }} showTooltip={false}>
          {header && Node.string(header)}
        </CodeVariable>{' '}
        ={' '}
      </span>
      {children}
    </CodeLine>
  );
};

const errorMessage = (message?: string): string => {
  if (message === 'No solutions') {
    return 'Syntax error';
  }
  return message ?? 'Unknown error';
};

const selectErrors = (
  blockResult?: IdentifiedResult | IdentifiedError
): Result.Result | undefined => {
  if (blockResult?.type === 'identified-error') {
    return {
      type: {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: errorMessage(blockResult.error?.message),
        },
      },
      value: Result.Unknown,
    };
  }
  if (
    blockResult?.type === 'computer-result' &&
    blockResult?.result?.type.kind === 'type-error'
  ) {
    return blockResult.result;
  }
  return undefined;
};
