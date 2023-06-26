import { selectErrorFromResult } from '@decipad/computer';
import { useAutoConvertToSmartRef } from '@decipad/editor-components';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { CodeLine, CodeVariable } from '@decipad/ui';
import { Node } from 'slate';
import { useSelected } from 'slate-react';
import { useTableColumnHeaderOfTableAbove } from '../../hooks';

const errorDebounceMs = 500;

export const TableColumnFormula: PlateComponent = ({ children, element }) => {
  assertElementType(element, ELEMENT_TABLE_COLUMN_FORMULA);
  const header = useTableColumnHeaderOfTableAbove(element, element.columnId);
  const errorResult = useComputer().getBlockIdResult$.useWithSelectorDebounced(
    errorDebounceMs,
    selectErrorFromResult,
    element.columnId
  );

  const selected = useSelected();

  useAutoConvertToSmartRef(element);

  return (
    <CodeLine
      variant="table"
      result={errorResult}
      highlight={selected}
      element={element}
    >
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
