import type { CellProps } from './types';
import { usePipedCellPluginOption } from './usePipedCellPluginOption';

export const useIsCellEditable = (cellProps: CellProps) => {
  const { plugins, isTableFrozen } = cellProps;
  const useEditable = usePipedCellPluginOption(plugins, 'useEditable');
  return useEditable(!isTableFrozen, cellProps);
};
