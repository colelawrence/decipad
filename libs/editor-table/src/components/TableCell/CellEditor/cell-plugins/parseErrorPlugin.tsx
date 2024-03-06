import type { CellValueType } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';

import type { CellPlugin } from '../types';
import { SyntaxErrorHighlight } from '@decipad/ui';

const EXCLUDE_CELL_KINDS: CellValueType['kind'][] = ['anything', 'string'];

export const parseErrorPlugin: CellPlugin = {
  query: (cellType) =>
    !!cellType && !EXCLUDE_CELL_KINDS.includes(cellType.kind),
  useRenderAboveReadOnly: (children, { element }) => {
    const computer = useComputer();

    const parseError = computer.getBlockIdResult$.useWithSelector(
      (elm) => elm?.error,
      element.id
    );

    const parseErrorMessage =
      typeof parseError === 'string' ? parseError : parseError?.message;

    return (
      <SyntaxErrorHighlight
        variant="custom"
        error={parseErrorMessage}
        hideError={!parseErrorMessage}
      >
        {children}
      </SyntaxErrorHighlight>
    );
  },
};
