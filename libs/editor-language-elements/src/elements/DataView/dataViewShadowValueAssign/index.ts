import { getExprRef } from '@decipad/remote-computer';
import type { Program } from '@decipad/computer-interfaces';
import { TimeSeriesElement, type DataViewElement } from '@decipad/editor-types';
import { generateAssembledTableDef } from './generateAssembledTableDef';
import { generateRoundingsTableDef } from './generateRoundingsTableDef';
import { generateAggregationDefs } from './generateAggregationDefs';
import { generateTreeFormation } from './generateTreeFormation';
import { generateFiltersTableDef } from './generateFiltersTableDef';

export const dataViewShadowValueAssign = (
  dataView: DataViewElement | TimeSeriesElement
): Program => {
  const [assembledTableDef, ...restAssembledTableDefs] =
    generateAssembledTableDef(dataView);
  const filtersTableDef = generateFiltersTableDef(dataView);
  const roundingsTableDef = generateRoundingsTableDef(dataView);
  const [aggregationsTableDef, ...moreAggregationDefs] =
    generateAggregationDefs(dataView);

  const treeFormation = generateTreeFormation(
    dataView,
    getExprRef(assembledTableDef.id),
    getExprRef(filtersTableDef.id),
    getExprRef(roundingsTableDef.id),
    getExprRef(aggregationsTableDef.id)
  );

  return [
    assembledTableDef,
    ...restAssembledTableDefs,
    filtersTableDef,
    roundingsTableDef,
    ...moreAggregationDefs,
    aggregationsTableDef,
    treeFormation,
  ];
};
