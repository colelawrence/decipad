import { IdentifiedError, IdentifiedResult } from '@decipad/computer';
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

export const TableColumnFormula: PlateComponent = ({ children, element }) => {
  assertElementType(element, ELEMENT_TABLE_COLUMN_FORMULA);
  const header = useTableColumnHeaderOfTableAbove(element, element.columnId);
  const typeErrorResult = useComputer().getBlockIdResult$.useWithSelector(
    selectTypeErrors,
    element.columnId
  );

  useAutoConvertToSmartRef(element);

  return (
    <CodeLine variant="table" result={typeErrorResult} element={element}>
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

const selectTypeErrors = (blockResult?: IdentifiedResult | IdentifiedError) => {
  if (blockResult?.result?.type.kind === 'type-error') {
    return blockResult.result;
  }
  return undefined;
};
