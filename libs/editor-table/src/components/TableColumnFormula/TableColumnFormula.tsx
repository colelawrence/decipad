import { useOnBlurNormalize } from '@decipad/editor-components';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  PlateComponent,
  TableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isElementOfType } from '@decipad/editor-utils';
import { useResult } from '@decipad/react-contexts';
import { CodeLine, CodeVariable } from '@decipad/ui';
import { ELEMENT_TABLE, findNodePath, getAboveNode } from '@udecode/plate';
import { Node } from 'slate';
import { useTableColumnHeaderOfTableAbove } from '../../hooks';

export const TableColumnFormula: PlateComponent = ({ children, element }) => {
  assertElementType(element, ELEMENT_TABLE_COLUMN_FORMULA);
  const header = useTableColumnHeaderOfTableAbove(element, element.columnId);
  const perhapsErrorTypedResult = useResult(element.id);

  const isTypeError =
    perhapsErrorTypedResult?.result?.type.kind === 'type-error';

  const editor = useTEditorRef();
  const path = findNodePath(editor, element)!;
  const entry = getAboveNode<TableElement>(editor, {
    at: path,
    match: (n) => isElementOfType(n, ELEMENT_TABLE),
  })!;

  // transform variable references in column formulas into smart refs on blur
  useOnBlurNormalize(editor, element, entry[0]);

  return (
    <CodeLine
      variant="table"
      result={(isTypeError && perhapsErrorTypedResult.result) || undefined}
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
