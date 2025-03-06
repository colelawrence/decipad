import { PlotDefaultColorScheme } from '@decipad/editor-types';
import { useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes } from 'libs/ui/src/primitives';
import { useMemo, useState } from 'react';
import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { renderAxisLabel } from '../Components/axis';
import { renderGrid } from '../Components/grid';
import {
  chartHeight,
  renderPieLabel,
  renderPieLegend,
  renderPieTooltipWithData,
} from '../helpers';
import { PieChartProps } from './types';
import { calculateChartHeight } from '../helpers/calculateChartHeight';

export const PieChart = ({
  table,
  xColumnName,
  yColumnNames,
  colorScheme,
  arcVariant = 'simple',
  showDataLabel = false,
  xAxisLabel,
  setXAxisLabel,
  size = 'medium',
}: PieChartProps) => {
  const [isDarkTheme] = useThemeFromStore();
  const yColumnName = useMemo(() => yColumnNames[0], [yColumnNames]);
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });
  const scheme = colorSchemes[colorScheme];
  const total = useMemo(() => {
    return table.reduce((acc, item) => acc + item[yColumnName], 0);
  }, [table, yColumnName]);
  const renderTooltip = renderPieTooltipWithData({ total, yColumnName });
  const renderLabelWithTotal = renderPieLabel(total, arcVariant);
  const supportLegacySchemes =
    scheme &&
    scheme.light_mode_colors != null &&
    scheme.dark_mode_colors != null
      ? scheme
      : colorSchemes[PlotDefaultColorScheme];
  const colors = isDarkTheme
    ? supportLegacySchemes.dark_mode_colors
    : supportLegacySchemes.light_mode_colors;
  const donutInnerRadius = 60;
  const labelBox = useMemo(() => {
    const diameter = 2 * donutInnerRadius;

    const left = -8 + (chartDimensions.width - diameter) / 2;
    const top = -20 + (chartDimensions.height - diameter) / 2;

    return {
      height: diameter,
      left,
      top,
    };
  }, [chartDimensions, donutInnerRadius]);
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
      <RePieChart>
        {renderGrid('pie-chart-1')}
        <Tooltip content={renderTooltip} />
        <Pie
          legendType="circle"
          data={table}
          dataKey={yColumnName}
          nameKey={xColumnName}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showDataLabel ? renderLabelWithTotal : undefined}
          innerRadius={arcVariant === 'donut' ? donutInnerRadius : undefined}
          fill={colors[0]?.hex}
        >
          {arcVariant === 'donut' && (
            <Label
              content={renderAxisLabel({
                axisLabel: xAxisLabel,
                setAxisLabel: setXAxisLabel,
                labelBox,
              })}
            />
          )}
          {table.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length].hex}
            />
          ))}
        </Pie>
        <Legend content={renderPieLegend} />
      </RePieChart>
    </ResponsiveContainer>
  );
};
