import { AggregationKind, Aggregator } from '../types';
import { average } from './average';
import { max } from './max';
import { median } from './median';
import { min } from './min';
import { span } from './span';
import { sum } from './sum';

export default {
  average,
  max,
  median,
  min,
  span,
  sum,
} as Record<AggregationKind, Aggregator>;
