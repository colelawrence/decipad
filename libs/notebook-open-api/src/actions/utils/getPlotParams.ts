import type {
  PlotElement,
  PlotParams,
  TableElement,
} from '@decipad/editor-types';
import { ELEMENT_PLOT, defaultPlotParams } from '@decipad/editor-types';
import { getExprRef } from '@decipad/remote-computer';
import { nanoid } from 'nanoid';
import { getNodeString } from '../../utils/getNodeString';

export const getPlotParams = (
  plotParams: Partial<PlotParams>,
  table: TableElement
): PlotElement => {
  const tableName = getNodeString(table.children[0].children[0]);
  const columnNames = table.children[1].children.map(getNodeString);
  const { markType = 'bar' } = plotParams;
  const baseParams: Pick<
    PlotElement,
    'type' | 'id' | 'markType' | 'sourceVarName'
  > = {
    type: ELEMENT_PLOT,
    id: nanoid(),
    markType,
    sourceVarName: getExprRef(table.id),
  };
  return {
    ...baseParams,
    ...plotParams,
    ...defaultPlotParams,
    yColumnNames:
      plotParams.yColumnNames ?? typeof columnNames[1] === 'string'
        ? [columnNames[1]]
        : [],
    xColumnName: plotParams.xColumnName ?? columnNames[0],
    yColumnChartTypes: plotParams.yColumnChartTypes ?? ['bar'],
    schema: 'jun-2024',
    title: `Data view for ${tableName}`,
    children: [{ text: '' }],
  };
};
