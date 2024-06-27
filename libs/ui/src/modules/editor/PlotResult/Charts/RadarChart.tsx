import { useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes } from 'libs/ui/src/primitives';
import { useMemo } from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as ReRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { plotBorder } from '../Components/styles';
import {
  chartHeight,
  defaultChartMargins,
  renderLineTooltipWithData,
  renderPieLegend,
} from '../helpers';
import { chartAxisFontStyles, tooltipCursorStyle } from './styles';
import { RadarChartProps } from './types';

export const RadarChart = ({
  table,
  xColumnName,
  yColumnNames,
  colorScheme,
  grid,
}: RadarChartProps) => {
  const [isDarkTheme] = useThemeFromStore();
  const renderTooltip = useMemo(
    () =>
      renderLineTooltipWithData({
        xColumnName,
        yColumnNames,
        tableWithGrowth: [],
      }),
    [xColumnName, yColumnNames]
  );

  const scheme = colorSchemes[colorScheme];
  const colors = isDarkTheme
    ? scheme.dark_mode_colors
    : scheme.light_mode_colors;

  return (
    <ResponsiveContainer width={'100%'} height={chartHeight}>
      <ReRadarChart data={table} margin={defaultChartMargins}>
        {grid && (
          <>
            <PolarGrid stroke={plotBorder} strokeDasharray="3 3" />
          </>
        )}
        <PolarAngleAxis dataKey={xColumnName} style={chartAxisFontStyles} />
        <PolarRadiusAxis angle={90} style={chartAxisFontStyles} />
        <Tooltip
          content={renderTooltip}
          contentStyle={tooltipCursorStyle(isDarkTheme)}
        />
        {yColumnNames?.map((columnName, i) => {
          const currentColor = colors[i % colors.length].hex;
          return (
            <Radar
              key={`${columnName}-${i}`}
              name={columnName}
              dataKey={columnName}
              stroke={currentColor}
              fill={currentColor}
              fillOpacity={0.6}
            />
          );
        })}
        {yColumnNames && yColumnNames.length > 1 && (
          <Legend content={renderPieLegend} />
        )}
      </ReRadarChart>
    </ResponsiveContainer>
  );
};
