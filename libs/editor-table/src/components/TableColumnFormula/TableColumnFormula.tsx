import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  PlateComponent,
} from '@decipad/editor-types';
import {
  assertElementType,
  useTableColumnFormulaResultForFormula,
} from '@decipad/editor-utils';
import { CodeLine, CodeVariable } from '@decipad/ui';
import { Node } from 'slate';
import { useTableColumnHeaderOfTableAbove } from '../../hooks';

export const TableColumnFormula: PlateComponent = ({ children, element }) => {
  assertElementType(element, ELEMENT_TABLE_COLUMN_FORMULA);
  const header = useTableColumnHeaderOfTableAbove(element, element.columnId);
  const result = useTableColumnFormulaResultForFormula(element);

  return (
    <CodeLine
      variant="table"
      result={(result?.type.kind === 'type-error' && result) || undefined}
    >
      <span contentEditable={false}>
        <CodeVariable type={{ kind: 'table-formula' }}>
          {header && Node.string(header)}
        </CodeVariable>{' '}
        ={' '}
      </span>
      {children}
    </CodeLine>
  );
};
