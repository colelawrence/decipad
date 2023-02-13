import { IdentifiedError, IdentifiedResult } from '@decipad/computer';
import { useOnBlurNormalize } from '@decipad/editor-components';
import {
  ELEMENT_TABLE_COLUMN_FORMULA,
  PlateComponent,
  TableElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, isElementOfType } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { CodeLine, CodeVariable } from '@decipad/ui';
import { ELEMENT_TABLE, findNodePath, getAboveNode } from '@udecode/plate';
import { Node } from 'slate';
import { useTableColumnHeaderOfTableAbove } from '../../hooks';

export const TableColumnFormula: PlateComponent = ({ children, element }) => {
  assertElementType(element, ELEMENT_TABLE_COLUMN_FORMULA);
  const header = useTableColumnHeaderOfTableAbove(element, element.columnId);
  const typeErrorResult = useComputer().getBlockIdResult$.useWithSelector(
    selectTypeErrors,
    element.columnId
  );

  const editor = useTEditorRef();
  const path = findNodePath(editor, element)!;
  const tableEntry = getAboveNode<TableElement>(editor, {
    at: path,
    match: (n) => isElementOfType(n, ELEMENT_TABLE),
  })!;

  // transform variable references in column formulas into smart refs on blur
  useOnBlurNormalize(editor, element, tableEntry[0]);

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
