// eslint-disable-next-line no-restricted-imports
import {
  buildType,
  Comparable,
  compare,
  getResultGenerator,
  metric,
  serializeType,
  Type,
  Value,
} from '@decipad/language-types';
import { Value as ValueType } from '@decipad/language-interfaces';
import { BuiltinSpec } from '../types';
import { getDefined } from '@decipad/utils';
import { timeUnitFromNumberType } from '../utils/timeUnitFromNumberType';
import { simpleUnitFromNumberType } from '../utils/simpleUnitFromNumberType';
import { all, first, from, slice } from '@decipad/generator-utils';
import { arraySortMap } from '../utils/arraySortMap';
import { applySortMap } from '../utils/applySortMap';
import { contiguousSlices } from '@decipad/column';
import { LeanColumn } from 'libs/language-types/src/Value';
import { getDeciNumber } from '@decipad/number';

export const metricOperators: Record<string, BuiltinSpec> = {
  metric: {
    argCount: [1, 2],
    functorNoAutomap: async ([type1, type2]) => {
      if (type2) {
        return (
          await Type.combine(
            (await (await type1.isColumn()).reduced()).isDate(),
            (await (await type2.isColumn()).reduced()).isScalar('number')
          )
        ).mapType(async (cellType) =>
          metric(getDefined((await type1.reduced()).date), cellType)
        );
      }
      return (await type1.isTable()).mapType(async (t) => {
        if (t.columnTypes?.length !== 2) {
          return t.withErrorCause('metric: expected table with 2 columns');
        }
        return (
          await Type.combine(
            t.columnTypes[0].isDate(),
            t.columnTypes[1].isScalar('number')
          )
        ).mapType((t2) => metric(getDefined(t.columnTypes?.[0].date), t2));
      });
    },
    fnValuesNoAutomap: async ([value1, value2]) => {
      if (value2) {
        return Value.Metric.from(
          Value.getColumnLike(value1),
          Value.getColumnLike(value2)
        );
      }
      const table = Value.getTableValue(value1);
      return Value.Metric.from(
        getDefined(table.columns[0]),
        getDefined(table.columns[1])
      );
    },
  },
  groupby: {
    argCount: [3],
    noAutoconvert: true,
    autoConvertArgs: false,
    functorNoAutomap: async (
      [metricType, dateGranularityType, reducerType],
      _,
      utils
    ) => {
      return (
        await Type.combine(
          metricType.isMetric(),
          getDefined(metricType.metricValueType).isScalar('number'),
          dateGranularityType.isScalar('number'),
          reducerType.isScalar('number')
        )
      ).mapType(async () => {
        const [resultType, dateGranularity] =
          timeUnitFromNumberType(dateGranularityType);
        if (resultType.errorCause) {
          return resultType;
        }
        const [reducerTypeResult, reducerFuncName] =
          simpleUnitFromNumberType(reducerType);
        if (reducerTypeResult.errorCause) {
          return reducerTypeResult;
        }
        const reducedType = await (
          await utils.callBuiltinFunctor(
            utils,
            getDefined(
              reducerFuncName,
              `groubBy: reducer function not found: ${reducerFuncName}`
            ),
            [buildType.column(getDefined(metricType.metricValueType))],
            []
          )
        ).isScalar('number'); // result also has to be a number
        if (reducedType.errorCause) {
          return reducedType;
        }
        return buildType.metric(
          getDefined(dateGranularity, 'groubBy: date granularity not found'),
          reducedType
        );
      });
    },
    fnValuesNoAutomap: async (
      [_metric, dateGranularityValue],
      [metricType, dateGranularityType, reducerType],
      utils
    ) => {
      const metric = getDefined(
        Value.getMetricValue(_metric),
        'groubBy: metric not found'
      );
      const [resultType, _dateGranularity] =
        timeUnitFromNumberType(dateGranularityType);
      if (resultType.errorCause) {
        throw new Error(resultType.errorCause.message);
      }
      const dateGranularity = getDefined(
        _dateGranularity,
        'groubBy: date granularity not found'
      );
      const [reducerTypeResult, reducerFuncName] =
        simpleUnitFromNumberType(reducerType);
      if (reducerTypeResult.errorCause) {
        throw new Error(reducerTypeResult.errorCause.message);
      }

      // to simplify implementation, we materialize the dates and values
      // we should fix this in the future
      const dates = await all(
        (
          await getResultGenerator(await metric.dates.getData())
        )()
      );
      // sort the dates but keep the sort map, so we can sort the values later
      const sorted = await arraySortMap(dates as Comparable[], compare);
      const sortedDates = applySortMap(dates, sorted);
      // sort the values
      const materializedSortedValues = applySortMap(
        await all(getResultGenerator(await metric.values.getData())()),
        sorted
      );

      // round the dates to the date granularity
      const roundedDates = Value.getColumnLike(
        await utils.callBuiltin(
          utils,
          'round',
          [
            Value.LeanColumn.fromGeneratorAndType(
              (start, end) => slice(from(sortedDates), start, end),
              serializeType(
                buildType.date(getDefined(metricType.metricGranularity))
              ),
              metric.dates.meta,
              'groubBy: mapped sorted dates'
            ),
            dateGranularityValue,
          ],
          [
            buildType.column(
              buildType.date(getDefined(metricType.metricGranularity))
            ),
            dateGranularityType,
          ],
          buildType.column(buildType.date(dateGranularity)),
          []
        )
      );

      // get the contiguous date map so we know how to group the values
      const slices = await contiguousSlices(roundedDates, compare);
      // group the values by the contiguous date map
      const groupedValues: ValueType.ColumnLikeValue[] = slices.map(
        ([start, end]) => {
          const relevantSlice = materializedSortedValues.slice(start, end + 1);
          return LeanColumn.fromGeneratorAndType(
            (start, end) => slice(from(relevantSlice), start, end),
            serializeType(getDefined(metricType.metricValueType)),
            metric.values.meta,
            'groubBy: mapped grouped values'
          );
        }
      );

      // reduce the grouped values
      const reducedValues = (
        await Promise.all(
          (
            await Promise.all(
              groupedValues.map(async (group) => {
                return utils.callBuiltin(
                  utils,
                  getDefined(
                    reducerFuncName,
                    'groubBy: reducer function not found'
                  ),
                  [group],
                  [buildType.column(getDefined(metricType.metricValueType))],
                  getDefined(metricType.metricValueType),
                  []
                );
              })
            )
          ).map(async (value) => value.getData())
        )
      ).map((v) => getDeciNumber(v));

      const resultValueColumn = LeanColumn.fromGeneratorAndType(
        (start, end) => slice(from(reducedValues), start, end),
        serializeType(getDefined(metricType.metricValueType)),
        metric.values.meta,
        'groubBy: mapped reduced values'
      );

      const roundedDatesResultGenerator = getResultGenerator(
        await roundedDates.getData()
      );
      const roundedDatesGroupHeaders = await Promise.all(
        slices.map(async ([start, end]) =>
          first(roundedDatesResultGenerator(start, end + 1))
        )
      );
      const datesColumn = LeanColumn.fromGeneratorAndType(
        (start, end) => slice(from(roundedDatesGroupHeaders), start, end),
        serializeType(buildType.date(dateGranularity)),
        metric.dates.meta,
        'groubBy: mapped reduced dates'
      );
      return Value.Metric.from(datesColumn, resultValueColumn);
    },
  },
};
