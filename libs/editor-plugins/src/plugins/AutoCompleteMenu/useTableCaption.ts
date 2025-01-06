import { useSelection } from '@decipad/editor-hooks';
import {
  ELEMENT_INTEGRATION,
  ELEMENT_TABLE,
  IntegrationTypes,
  TableElement,
  useMyEditorRef,
} from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import {
  getAboveNode,
  getNodeString,
  isCollapsed,
  isElement,
} from '@udecode/plate-common';
import { useMemo } from 'react';

export const useTableCaption = (): string | undefined => {
  const editor = useMyEditorRef();
  const selection = useSelection();
  return useMemo(() => {
    if (selection == null || !isCollapsed(selection)) {
      return undefined;
    }

    const tableAboveEntry = getAboveNode(editor, {
      at: selection.anchor,
      match: (n) =>
        isElement(n) &&
        (n.type === ELEMENT_TABLE || n.type === ELEMENT_INTEGRATION),
    });
    if (tableAboveEntry == null) {
      return undefined;
    }

    const [_tableAbove] = tableAboveEntry;
    if (isElementOfType(_tableAbove, ELEMENT_TABLE)) {
      const tableAbove = _tableAbove as TableElement;
      return getNodeString(tableAbove.children[0]?.children[0]);
    }

    if (isElementOfType(_tableAbove, ELEMENT_INTEGRATION)) {
      const integrationAbove = _tableAbove as IntegrationTypes.IntegrationBlock;
      return getNodeString(integrationAbove.children[0]);
    }

    return undefined;
  }, [editor, selection]);
};
