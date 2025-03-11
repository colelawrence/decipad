import { useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes } from 'libs/ui/src/primitives';
import { useMemo } from 'react';
import {
  Bar,
  BarChart as ReBarChart,
  Legend as ReLegend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { horizontalAxis, verticalAxis } from '../Components/axis';
import { renderGrid } from '../Components/grid';
import { RadiusProps } from '../Components/types';
import {
  calculateGrowth,
  chartHeight,
  renderLineTooltipWithData,
  renderPieLegend,
  renderShapeLabel,
  toPercent,
} from '../helpers';
import { tooltipCursorStyle } from './styles';
import { BarChartProps } from './types';
import { calculateChartHeight } from '../helpers/calculateChartHeight';
import { customTick } from '../Components/CustomTick';
import { useChartMargins } from '../hooks/useChartMargins';

const radiusSize = 4;
export const roundedEndsHorizontal = [
  radiusSize,
  radiusSize,
  0,
  0,
] as RadiusProps;
export const roundedEndsVertical = [
  0,
  radiusSize,
  radiusSize,
  0,
] as RadiusProps;

export const BarChart = ({
  table,
  xColumnName,
  yColumnNames,
  orientation = 'horizontal',
  colorScheme,
  grid,
  startFromZero = true,
  showDataLabel = false,
  barVariant = 'grouped',
  xAxisLabel,
  yAxisLabel,
  setXAxisLabel,
  setYAxisLabel,
  isExporting,
  size = 'medium',
}: BarChartProps) => {
  const stackId = barVariant && barVariant !== 'grouped' ? '1' : undefined;
  const [isDarkTheme] = useThemeFromStore();

  const tableWithGrowth = useMemo(
    () => calculateGrowth({ table, yColumnNames }),
    [table, yColumnNames]
  );

  const tickFormatter = barVariant === 'stacked100' ? toPercent : undefined;

  const renderTooltip = useMemo(
    () =>
      renderLineTooltipWithData({ xColumnName, yColumnNames, tableWithGrowth }),
    [xColumnName, yColumnNames, tableWithGrowth]
  );

  const xyAxis = useMemo(
    () =>
      horizontalAxis({
        startFromZero,
        xColumnName,
        xAxisLabel,
        setXAxisLabel,
        yAxisLabel,
        setYAxisLabel,
        tickFormatter,
        customTick,
        isExporting,
      }),
    [
      startFromZero,
      xColumnName,
      xAxisLabel,
      setXAxisLabel,
      yAxisLabel,
      setYAxisLabel,
      tickFormatter,
      isExporting,
    ]
  );

  const yxAxis = useMemo(() => {
    return verticalAxis({
      startFromZero,
      xColumnName,
      xAxisLabel,
      setXAxisLabel,
      yAxisLabel,
      setYAxisLabel,
      tickFormatter,
      customTick,
      isExporting,
    });
  }, [
    setXAxisLabel,
    setYAxisLabel,
    startFromZero,
    xAxisLabel,
    xColumnName,
    yAxisLabel,
    tickFormatter,
    isExporting,
  ]);

  const maxAbsoluteValue = useMemo(() => {
    return yColumnNames.reduce((maxAcc, columnName) => {
      const columnMax = table.reduce(
        (max, item) => Math.max(max, Math.abs(item[columnName])),
        -Infinity
      );
      return Math.max(maxAcc, columnMax);
    }, -Infinity);
  }, [table, yColumnNames]);

  const sumAllValues = useMemo(() => {
    return yColumnNames.reduce((sumAcc, columnName) => {
      const columnSum = table.reduce((sum, item) => sum + item[columnName], 0);
      return sumAcc + columnSum;
    }, 0);
  }, [table, yColumnNames]);

  const dynamicChartMargins = useChartMargins({
    table,
    yColumnNames,
    xColumnName,
    orientation,
  });

  const renderBarLabel = useMemo(
    () =>
      renderShapeLabel({
        orientation,
        barVariant,
        referenceValue:
          barVariant === 'grouped'
            ? maxAbsoluteValue
            : barVariant === 'stacked100'
            ? 1000 // four characters, 100%
            : sumAllValues,
      }),
    [orientation, barVariant, maxAbsoluteValue, sumAllValues]
  );

  const scheme = colorSchemes[colorScheme];
  const colors = isDarkTheme
    ? scheme.dark_mode_colors
    : scheme.light_mode_colors;
  const radiusFor = (
    isLastIteration: boolean
  ): [number, number, number, number] =>
    barVariant === 'grouped'
      ? orientation === 'horizontal'
        ? roundedEndsHorizontal
        : roundedEndsVertical
      : isLastIteration && barVariant === 'stacked'
      ? orientation === 'horizontal'
        ? roundedEndsHorizontal
        : roundedEndsVertical
      : [0, 0, 0, 0];
  return (
    <ResponsiveContainer
      width={'100%'}
      height={calculateChartHeight(size, chartHeight)}
    >
      <ReBarChart
        data={table}
        margin={dynamicChartMargins}
        layout={orientation}
        barGap={2}
        stackOffset={
          barVariant === 'stacked100'
            ? 'expand'
            : barVariant === 'stacked'
            ? 'sign'
            : 'none'
        }
      >
        {grid && renderGrid('bar-chart-1')}
        <Tooltip
          content={renderTooltip}
          cursor={tooltipCursorStyle(isDarkTheme)}
        />
        {yColumnNames?.map((columnName, i) => {
          const isLastIteration = i === yColumnNames.length - 1;
          const currentColor = colors[i % colors.length].hex;

          return (
            <Bar
              key={`${columnName}-${i}`}
              dataKey={columnName}
              legendType="circle"
              fill={currentColor}
              radius={radiusFor(isLastIteration)}
              label={showDataLabel ? renderBarLabel : undefined}
              stackId={stackId}
            />
          );
        })}
        {orientation === 'horizontal' ? xyAxis : yxAxis}

        {yColumnNames && yColumnNames.length > 1 && (
          <ReLegend content={renderPieLegend} />
        )}
      </ReBarChart>
    </ResponsiveContainer>
  );
};
