import { TableElement } from '@decipad/editor-types';
import { useColumnsInferredTypes } from './useColumnsInferredTypes';
import { TableInfo } from '../types';
import { useTableInfo } from './useTableInfo';

const defaultTableInfo: TableInfo = {
  name: '',
  columns: [],
  headers: [],
  rowCount: 0,
};

export const useTable = (el: TableElement): TableInfo => {
  const columnTypes = useColumnsInferredTypes(el);
  return useTableInfo(el, columnTypes) ?? defaultTableInfo;
};
