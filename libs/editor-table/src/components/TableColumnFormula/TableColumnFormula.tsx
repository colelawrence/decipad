import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { atoms, organisms } from '@decipad/ui';
import { Node } from 'slate';
import { useTableColumnHeaderOfTableAbove } from '../../hooks';

export const TableColumnFormula: PlateComponent = ({ children, element }) => {
  assertElementType(element, ELEMENT_TABLE_COLUMN_FORMULA);
  const header = useTableColumnHeaderOfTableAbove(element, element.columnId);
  return (
    <organisms.CodeLine variant="table">
      <span contentEditable={false}>
        <atoms.CodeVariable type={{ kind: 'table-formula' }}>
          {header && Node.string(header)}
        </atoms.CodeVariable>{' '}
        ={' '}
      </span>
      {children}
    </organisms.CodeLine>
  );
};
