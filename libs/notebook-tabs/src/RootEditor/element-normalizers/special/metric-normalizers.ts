import { MetricElement } from '@decipad/editor-types';
import { Normalizer } from '../element-normalizer';
import { allAggregationIds } from '@decipad/language-aggregations';

export const metricNormalizer: Normalizer<MetricElement> = ([node, path]) => {
  if (
    node.aggregation != null &&
    !allAggregationIds.includes(node.aggregation)
  ) {
    return {
      type: 'set_node',
      properties: {
        aggregation: node.aggregation,
      } satisfies Partial<MetricElement>,
      newProperties: {} satisfies Partial<MetricElement>,
      path,
    };
  }

  if (
    node.comparisonAggregation != null &&
    !allAggregationIds.includes(node.comparisonAggregation)
  ) {
    return {
      type: 'set_node',
      properties: {
        comparisonAggregation: node.comparisonAggregation,
      } satisfies Partial<MetricElement>,
      newProperties: {} satisfies Partial<MetricElement>,
      path,
    };
  }

  return undefined;
};
