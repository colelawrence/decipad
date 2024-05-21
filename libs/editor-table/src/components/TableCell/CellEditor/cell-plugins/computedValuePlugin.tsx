import { useTableColumnFormulaResultForCell } from '@decipad/editor-hooks';
import type { SerializedType } from '@decipad/remote-computer';
import { CodeResult } from '@decipad/ui';
import { containsExprRef } from '@decipad/utils';

import type { CellPlugin } from '../types';

export const computedValuePlugin: CellPlugin = {
  query: (_cellType, value) => containsExprRef(value ?? ''),
  useRenderAboveReadOnly: (children, { element, renderComputedValue }) => {
    const result = useTableColumnFormulaResultForCell(element);

    if (!renderComputedValue || !result || result?.type.kind === 'type-error')
      return <>{children}</>;

    return (
      <>
        <CodeResult
          parentType={{ kind: 'table' } as SerializedType}
          {...result}
          element={element}
        />
      </>
    );
  },
};
