import { useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes } from 'libs/ui/src/primitives';
import { useMemo, useState } from 'react';
import {
  Cell,
  LabelList,
  ScatterChart as ReScatterChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import {
  propsForAllAxis,
  propsForMirroredAxis,
  propsForNumberAxis,
  renderAxisLabel,
} from '../Components/axis';
import { renderGrid } from '../Components/grid';
import {
  chartHeight,
  defaultChartMargins,
  renderScatterLabel,
  renderScatterTooltip,
} from '../helpers';
import { tooltipCursorStyle } from './styles';
import { ScatterChartProps } from './types';
import { calculateChartHeight } from '../helpers/calculateChartHeight';

export const ScatterChart = ({
  table,
  xColumnName,
  yColumnNames,
  labelColumnName,
  sizeColumnName,
  colorScheme,
  grid = true,
  startFromZero = true,
  orientation = 'horizontal',
  showDataLabel = false,
  xAxisLabel,
  yAxisLabel,
  setXAxisLabel,
  setYAxisLabel,
  isExporting,
  size = 'medium',
}: ScatterChartProps) => {
  const [isDarkTheme] = useThemeFromStore();
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });
  const scheme = colorSchemes[colorScheme];
  const colors = isDarkTheme
    ? scheme.dark_mode_colors
    : scheme.light_mode_colors;
  const yColumnName = useMemo(() => yColumnNames[0], [yColumnNames]);
  const renderLabelForScatterTop = useMemo(
    () => renderScatterLabel({ ...chartDimensions, top: true }),
    [chartDimensions]
  );
  const minRange = useMemo(() => {
    return sizeColumnName
      ? Math.min(...table.map((item) => item[sizeColumnName]))
      : 10;
  }, [sizeColumnName, table]);

  const maxRange = useMemo(() => {
    return sizeColumnName
      ? Math.max(...table.map((item) => item[sizeColumnName]))
      : 10;
  }, [sizeColumnName, table]);

  const renderTooltip = useMemo(
    () =>
      renderScatterTooltip({
        labelColumnName,
      }),
    [labelColumnName]
  );
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
      <ReScatterChart margin={defaultChartMargins} layout={orientation}>
        {grid && renderGrid('line-scatter-1')}
        <Tooltip
          content={renderTooltip}
          cursor={tooltipCursorStyle(isDarkTheme)}
        />
        {orientation === 'horizontal' ? (
          <>
            <XAxis
              type="number"
              dataKey={xColumnName}
              name={xColumnName}
              label={renderAxisLabel({
                axisLabel: xAxisLabel,
                setAxisLabel: setXAxisLabel,
                isExporting,
              })}
              {...propsForNumberAxis({ startFromZero })}
              {...propsForAllAxis}
            />
            <YAxis
              type="number"
              dataKey={yColumnName}
              name={yColumnName}
              label={renderAxisLabel({
                axisLabel: yAxisLabel,
                setAxisLabel: setYAxisLabel,
                isExporting,
                yAxis: true,
              })}
              {...propsForNumberAxis({ startFromZero })}
              {...propsForMirroredAxis({})}
              {...propsForAllAxis}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              dataKey={yColumnName}
              name={yColumnName}
              label={renderAxisLabel({
                axisLabel: xAxisLabel,
                setAxisLabel: setXAxisLabel,
                isExporting,
              })}
              {...propsForNumberAxis({ startFromZero })}
              {...propsForAllAxis}
            />
            <YAxis
              dataKey={xColumnName}
              name={xColumnName}
              type="number"
              label={renderAxisLabel({
                axisLabel: yAxisLabel,
                setAxisLabel: setYAxisLabel,
                isExporting,
                yAxis: true,
              })}
              {...propsForNumberAxis({ startFromZero })}
              {...propsForMirroredAxis({})}
              {...propsForAllAxis}
            />
          </>
        )}
        {sizeColumnName && (
          <ZAxis
            type="number"
            dataKey={sizeColumnName}
            range={[minRange, maxRange]}
          />
        )}
        <Scatter
          name={`scatter`}
          data={table}
          shape={'circle'}
          legendType={'circle'}
        >
          {table.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length].hex}
              opacity={0.8}
            />
          ))}
          {showDataLabel && (
            <LabelList
              dataKey={labelColumnName || yColumnName}
              content={renderLabelForScatterTop}
            />
          )}
        </Scatter>
      </ReScatterChart>
    </ResponsiveContainer>
  );
};
