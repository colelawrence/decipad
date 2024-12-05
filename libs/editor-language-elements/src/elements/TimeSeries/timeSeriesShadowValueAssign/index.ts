import { getExprRef } from '@decipad/remote-computer';
import type { Program } from '@decipad/computer-interfaces';
import { type TimeSeriesElement } from '@decipad/editor-types';
import { generateAssembledTableDef } from './generateAssembledTableDef';
import { generateRoundingsTableDef } from './generateRoundingsTableDef';
import { generateAggregationDefs } from './generateAggregationDefs';
import { generateTreeFormation } from './generateTreeFormation';
import { generateFiltersTableDef } from './generateFiltersTableDef';

export const timeSeriesShadowValueAssign = (
  timeSeries: TimeSeriesElement
): Program => {
  const [assembledTableDef, ...restAssembledTableDefs] =
    generateAssembledTableDef(timeSeries);
  const filtersTableDef = generateFiltersTableDef(timeSeries);
  const roundingsTableDef = generateRoundingsTableDef(timeSeries);
  const [aggregationsTableDef, ...moreAggregationDefs] =
    generateAggregationDefs(timeSeries);

  const treeFormation = generateTreeFormation(
    timeSeries,
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
