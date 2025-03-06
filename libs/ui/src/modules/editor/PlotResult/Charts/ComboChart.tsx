import { useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes } from 'libs/ui/src/primitives';
import { useMemo, useState } from 'react';
import {
  Bar,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { horizontalAxis, verticalAxis } from '../Components/axis';
import { renderGrid } from '../Components/grid';
import {
  calculateGrowth,
  chartHeight,
  defaultChartMargins,
  renderLineLabel,
  renderLineTooltipWithData,
  renderPieLegend,
  renderShapeLabel,
} from '../helpers';
import { roundedEndsHorizontal, roundedEndsVertical } from './BarChart';
import { activeDotStyle, tooltipCursorStyle } from './styles';
import { ComboChartProps } from './types';
import { calculateChartHeight } from '../helpers/calculateChartHeight';
import { customTick } from '../Components/CustomTick';

export const ComboChart = ({
  table,
  xColumnName,
  yColumnNames,
  colorScheme,
  yColumnChartType = [],
  orientation = 'horizontal',
  grid = true,
  startFromZero = true,
  showDataLabel = false,
  xAxisLabel,
  yAxisLabel,
  setXAxisLabel,
  setYAxisLabel,
  isExporting,
  size = 'medium',
}: ComboChartProps) => {
  const [isDarkTheme] = useThemeFromStore();
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });
  const tableWithGrowth = useMemo(
    () => calculateGrowth({ table, yColumnNames }),
    [table, yColumnNames]
  );

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
        isExporting,
      }),
    [
      setXAxisLabel,
      setYAxisLabel,
      startFromZero,
      xAxisLabel,
      xColumnName,
      yAxisLabel,
      isExporting,
    ]
  );

  const yxAxis = useMemo(
    () =>
      verticalAxis({
        startFromZero,
        xColumnName,
        xAxisLabel,
        setXAxisLabel,
        yAxisLabel,
        setYAxisLabel,
        customTick,
        isExporting,
      }),
    [
      setXAxisLabel,
      setYAxisLabel,
      startFromZero,
      xAxisLabel,
      xColumnName,
      yAxisLabel,
      isExporting,
    ]
  );

  const renderLabelForLine = useMemo(
    () => renderLineLabel(chartDimensions),
    [chartDimensions]
  );

  const maxAbsoluteValue = useMemo(() => {
    return yColumnNames.reduce((maxAcc, columnName) => {
      const columnMax = table.reduce(
        (max, item) => Math.max(max, Math.abs(item[columnName])),
        -Infinity
      );
      return Math.max(maxAcc, columnMax);
    }, -Infinity);
  }, [table, yColumnNames]);

  const renderBarLabel = useMemo(
    () =>
      renderShapeLabel({
        orientation,
        barVariant: 'grouped',
        referenceValue: maxAbsoluteValue,
      }),
    [maxAbsoluteValue, orientation]
  );

  const yLineColumnNames = yColumnNames.filter(
    (_, i) => yColumnChartType[i] !== 'bar'
  );
  const yBarColumnNames = yColumnNames.filter(
    (_, i) => yColumnChartType[i] === 'bar'
  );

  const scheme = colorSchemes[colorScheme];
  const colors = isDarkTheme
    ? scheme.dark_mode_colors
    : scheme.light_mode_colors;

  const radiusFor = (): [number, number, number, number] =>
    orientation === 'horizontal' ? roundedEndsHorizontal : roundedEndsVertical;
  return (
    <ResponsiveContainer
      width={'100%'}
      height={calculateChartHeight(size, chartHeight)}
      onResize={(width, height) => {
        if (width && height) {
          setChartDimensions({
            width,
            height,
          });
        }
      }}
    >
      <ComposedChart
        data={table}
        margin={defaultChartMargins}
        layout={orientation}
      >
        {grid && renderGrid('combo-chart')}
        <Tooltip
          content={renderTooltip}
          cursor={tooltipCursorStyle(isDarkTheme)}
        />
        {yBarColumnNames?.map((columnName, i) => {
          const currentColor =
            colors[(i + yLineColumnNames.length) % colors.length].hex;

          return (
            <Bar
              key={`${columnName}-${i}`}
              dataKey={columnName}
              legendType="circle"
              fill={currentColor}
              radius={radiusFor()}
              label={showDataLabel ? renderBarLabel : undefined}
            />
          );
        })}
        {yLineColumnNames?.map((columnName, i) => {
          const currentColor = colors[i % colors.length].hex;

          return (
            <Line
              key={`${columnName}-${i}`}
              type="monotone"
              dataKey={columnName}
              legendType="circle"
              stroke={currentColor}
              strokeWidth={2}
              dot={false}
              activeDot={activeDotStyle(currentColor)}
              label={showDataLabel ? renderLabelForLine : undefined}
            />
          );
        })}
        {orientation === 'horizontal' ? xyAxis : yxAxis}
        {yColumnNames && yColumnNames.length > 1 && (
          <Legend content={renderPieLegend} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
