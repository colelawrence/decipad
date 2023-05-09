import {
  CellValueType,
  TableElement,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useEditorSelector } from '@decipad/react-contexts';
import { ELEMENT_TABLE, findNode, getNodeString } from '@udecode/plate';
import { isElementOfType } from '@decipad/editor-utils';
import { useCallback } from 'react';
import { useColumnsInferredTypes } from './useColumnsInferredTypes';

export interface TableColumn {
  blockId: string;
  name: string;
  cellType: CellValueType;
}

export interface TableInfo {
  name: string;
  columns: TableColumn[];
  headers: TableHeaderElement[];
  rowCount: number;
}

const defaultTableInfo: TableInfo = {
  name: '',
  columns: [],
  headers: [],
  rowCount: 0,
};

export const useTable = (el: TableElement): TableInfo => {
  const columnTypes = useColumnsInferredTypes(el);
  return useEditorSelector(
    useCallback(
      (editor) => {
        const entry = findNode(editor, { match: { id: el.id } });
        if (!entry) {
          return defaultTableInfo;
        }
        const element = entry[0];
        if (!isElementOfType(element, ELEMENT_TABLE)) {
          return defaultTableInfo;
        }
        return {
          name: getNodeString(element.children[0].children[0]),
          headers: element.children[1]?.children ?? [],
          columns:
            element.children[1]?.children.map((th, index) => ({
              blockId: th.id,
              name: getNodeString(th),
              cellType: columnTypes[index] ?? { kind: 'nothing' },
            })) ?? [],
          rowCount: element.children.length - 2,
        };
      },
      [columnTypes, el.id]
    )
  );
};
