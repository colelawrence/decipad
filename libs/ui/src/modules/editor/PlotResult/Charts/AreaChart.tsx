import { useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes, cssVar } from 'libs/ui/src/primitives';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart as ReAreaChart,
  Legend as ReLegend,
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
  toPercent,
} from '../helpers';
import { activeDotStyle, tooltipCursorStyle } from './styles';
import { AreaChartProps } from './types';

export const AreaChart = ({
  table,
  xColumnName,
  yColumnNames,
  colorScheme,
  orientation = 'horizontal',
  grid = true,
  startFromZero = true,
  showDataLabel = false,
  stackOffset = 'none',
  xAxisLabel,
  yAxisLabel,
  setXAxisLabel,
  setYAxisLabel,
  isExporting,
}: AreaChartProps) => {
  const [isDarkTheme] = useThemeFromStore();
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });
  const tableWithGrowth = useMemo(
    () => calculateGrowth({ table, yColumnNames }),
    [table, yColumnNames]
  );

  const tickFormatter = stackOffset === 'none' ? undefined : toPercent;

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
        isExporting,
      }),
    [
      setXAxisLabel,
      setYAxisLabel,
      startFromZero,
      xAxisLabel,
      xColumnName,
      yAxisLabel,
      tickFormatter,
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
        tickFormatter,
        isExporting,
      }),
    [
      setXAxisLabel,
      setYAxisLabel,
      startFromZero,
      xAxisLabel,
      xColumnName,
      yAxisLabel,
      tickFormatter,
      isExporting,
    ]
  );

  const renderLabelForLine = useMemo(
    () => renderLineLabel(chartDimensions),
    [chartDimensions]
  );
  const scheme = colorSchemes[colorScheme];
  const colors = isDarkTheme
    ? scheme.dark_mode_colors
    : scheme.light_mode_colors;
  return (
    <ResponsiveContainer
      width={'100%'}
      height={chartHeight}
      onResize={(width, height) => {
        if (width && height) {
          setChartDimensions({
            width,
            height,
          });
        }
      }}
    >
      <ReAreaChart
        data={table}
        margin={defaultChartMargins}
        layout={orientation}
        stackOffset={stackOffset}
      >
        <defs>
          {yColumnNames?.map((_, i) => (
            <linearGradient
              key={i}
              id={`colorGradient-${colorScheme}-${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={colors[i % colors.length].hex}
                stopOpacity="0.9"
              ></stop>
              <stop
                offset="95%"
                stopColor={cssVar('backgroundSubdued')}
                stopOpacity="0.9"
              ></stop>
            </linearGradient>
          ))}
        </defs>

        {grid && stackOffset !== 'expand' && renderGrid('area-chart-1')}
        <Tooltip
          content={renderTooltip}
          cursor={tooltipCursorStyle(isDarkTheme)}
        />
        {yColumnNames?.map((columnName, i) => {
          const currentColor = colors[i % colors.length].hex;
          return (
            <Area
              key={`${columnName}-${i}`}
              type="monotone"
              dataKey={columnName}
              legendType="circle"
              stroke={currentColor}
              strokeWidth={stackOffset === 'expand' ? 0 : 2}
              dot={false}
              activeDot={activeDotStyle(currentColor)}
              label={showDataLabel ? renderLabelForLine : undefined}
              fillOpacity={1}
              fill={
                stackOffset === 'none'
                  ? `url(#colorGradient-${colorScheme}-${i})`
                  : currentColor
              }
              stackId="1"
            />
          );
        })}
        {orientation === 'horizontal' ? xyAxis : yxAxis}

        {yColumnNames && yColumnNames.length > 1 && (
          <ReLegend content={renderPieLegend} />
        )}
      </ReAreaChart>
    </ResponsiveContainer>
  );
};
