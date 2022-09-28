import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useResult } from '@decipad/react-contexts';
import { CodeLine, CodeVariable } from '@decipad/ui';
import { Node } from 'slate';
import { useTableColumnHeaderOfTableAbove } from '../../hooks';

export const TableColumnFormula: PlateComponent = ({ children, element }) => {
  assertElementType(element, ELEMENT_TABLE_COLUMN_FORMULA);
  const header = useTableColumnHeaderOfTableAbove(element, element.columnId);
  const perhapsErrorTypedResult = useResult(element.id);

  const isTypeError =
    perhapsErrorTypedResult?.result?.type.kind === 'type-error';

  return (
    <CodeLine
      variant="table"
      result={(isTypeError && perhapsErrorTypedResult.result) || undefined}
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
