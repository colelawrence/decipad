import { Type, Value as ValueInterface } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { buildType, Value } from '@decipad/language-types';
import { TRealm } from '../scopedRealm';
import { getDefined } from '@decipad/utils';

export const metricToTable = {
  type: (_realm: TRealm, source: Type): Type => {
    return buildType.table({
      columnTypes: [
        buildType.date(
          getDefined(
            source.metricGranularity,
            'invalid metric type: should have a granularity'
          )
        ),
        getDefined(
          source.metricValueType,
          'invalid metric type: should have a value type'
        ),
      ],
      columnNames: ['Date', 'Value'],
    });
  },
  value: (
    _realm: TRealm,
    source: ValueInterface.Value
  ): ValueInterface.Value => {
    const metric = getDefined(
      Value.getMetricValue(source),
      'invalid metric value type'
    );
    return Value.Table.fromNamedColumns(
      [Value.getColumnLike(metric.dates), Value.getColumnLike(metric.values)],
      ['Date', 'Value'],
      undefined
    );
  },
};
