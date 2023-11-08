import { ELEMENT_PLOT, PlotElement, TableElement } from '@decipad/editor-types';
import { getNodeString } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { getExprRef } from '@decipad/remote-computer';
import { PlotParams } from '../../types';

export const getPlotParams = (
  plotParams: Partial<PlotParams>,
  table: TableElement
): PlotElement => {
  const tableName = getNodeString(table.children[0].children[0]);
  const columnNames = table.children[1].children.map(getNodeString);
  const { plotType = 'bar' } = plotParams;
  const baseParams: Pick<
    PlotElement,
    'type' | 'id' | 'markType' | 'sourceVarName'
  > = {
    type: ELEMENT_PLOT,
    id: nanoid(),
    markType: plotType,
    sourceVarName: getExprRef(table.id),
  };
  if (plotType === 'arc') {
    return {
      ...baseParams,
      ...plotParams,
      colorColumnName: plotParams.colorColumnName ?? columnNames[0],
      thetaColumnName: plotParams.thetaColumnName ?? columnNames[1],
      children: [{ text: '' }],
    };
  }
  return {
    ...baseParams,
    ...plotParams,
    xColumnName: plotParams.xColumnName ?? columnNames[0],
    yColumnName: plotParams.yColumnName ?? columnNames[1],
    title: `Data view for ${tableName}`,
    children: [{ text: '' }],
  };
};
