import { useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes } from 'libs/ui/src/primitives';
import { useMemo, useState } from 'react';
import {
  Area,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { horizontalAxis, verticalAxis } from '../Components/axis';
import { renderGrid } from '../Components/grid';
import { plotBorder } from '../Components/styles';
import {
  calculateGrowth,
  chartHeight,
  defaultChartMargins,
  renderLineLabel,
  renderLineTooltipWithData,
  renderPieLegend,
} from '../helpers';
import { activeDotStyle, tooltipCursorStyle } from './styles';
import { LineChartProps } from './types';
import { calculateChartHeight } from '../helpers/calculateChartHeight';
import { customTick } from '../Components/CustomTick';

export const LineChart = ({
  table,
  xColumnName,
  yColumnNames,
  colorScheme,
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
}: LineChartProps) => {
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

  const scheme = colorSchemes[colorScheme];
  const colors = isDarkTheme
    ? scheme.dark_mode_colors
    : scheme.light_mode_colors;
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
        <defs>
          <linearGradient
            id={`colorGradient-${colorScheme}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor={colors[0].hex}
              stopOpacity="0.1"
            ></stop>
            <stop offset="95%" stopColor={plotBorder} stopOpacity="0.1"></stop>
          </linearGradient>
        </defs>

        {grid && renderGrid('line-chart-1')}
        <Tooltip
          content={renderTooltip}
          cursor={tooltipCursorStyle(isDarkTheme)}
        />
        {yColumnNames?.map((columnName, i) => {
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
        {yColumnNames?.length === 1 && (
          <Area
            type="monotone"
            dataKey={yColumnNames[0]}
            stroke={'none'}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#colorGradient-${colorScheme})`}
          />
        )}
        {orientation === 'horizontal' ? xyAxis : yxAxis}
        {yColumnNames && yColumnNames.length > 1 && (
          <Legend content={renderPieLegend} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
