import { useThemeFromStore } from '@decipad/react-contexts';
import { colorSchemes } from 'libs/ui/src/primitives';
import { useCallback, useMemo, useState } from 'react';
import {
  Area,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { horizontalAxis, verticalAxis } from '../Components/axis';
import {
  calculateGrowth,
  chartHeight,
  defaultChartMargins,
  renderFunnelLabel,
  renderLineTooltipWithData,
  renderShapeLabel,
} from '../helpers';
import { roundedEndsHorizontal, roundedEndsVertical } from './BarChart';
import { tooltipCursorStyle } from './styles';
import { FunnelChartProps } from './types';
import { calculateChartHeight } from '../helpers/calculateChartHeight';
import { customTick } from '../Components/CustomTick';

export const FunnelChart = ({
  table,
  xColumnName,
  yColumnNames,
  colorScheme,
  orientation = 'horizontal',
  mirrorYAxis,
  showDataLabel = false,
  size = 'medium',
}: FunnelChartProps) => {
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

  const maxAbsoluteValue = useMemo(() => {
    return yColumnNames.reduce((maxAcc, columnName) => {
      const columnMax = table.reduce(
        (max, item) => Math.max(max, Math.abs(item[columnName])),
        -Infinity
      );
      return Math.max(maxAcc, columnMax);
    }, -Infinity);
  }, [table, yColumnNames]);

  const localMaxForColumn = useMemo(() => {
    return yColumnNames.map((columnName) => {
      const columnMax = table.reduce(
        (max, item) => Math.max(max, Math.abs(item[columnName])),
        -Infinity
      );

      return columnMax === -Infinity ? undefined : columnMax;
    });
  }, [table, yColumnNames]);

  const nrBars = useMemo(() => {
    if (!xColumnName) return 0;
    return table.filter((item) => item[xColumnName]).length;
  }, [table, xColumnName]);

  const renderBarLabel = useMemo(
    () =>
      renderShapeLabel({
        orientation,
        barVariant: 'grouped',
        referenceValue: maxAbsoluteValue,
      }),
    [maxAbsoluteValue, orientation]
  );

  const barGap = useMemo(() => {
    return orientation === 'horizontal'
      ? chartDimensions.width / (nrBars * 4 - 1)
      : chartDimensions.height / (nrBars * 4 - 1);
  }, [chartDimensions, nrBars, orientation]);

  const xyAxis = useMemo(
    () =>
      horizontalAxis({
        xColumnName,
        startFromZero: true,
        xAxisOffset: -barGap,
        reverseY: mirrorYAxis,
      }),
    [barGap, mirrorYAxis, xColumnName]
  );

  const yxAxis = useMemo(
    () =>
      verticalAxis({
        startFromZero: true,
        xColumnName,
        yAxisOffset: -barGap,
        reverseY: mirrorYAxis,
        customTick,
      }),
    [barGap, mirrorYAxis, xColumnName]
  );

  const renderLabelForFunnel = useCallback(
    (index: number) =>
      renderFunnelLabel({
        orientation,
        barCategoryGap: barGap,
        axisHeight: 30,
        nrBars,
        localMax: localMaxForColumn[index],
        ...chartDimensions,
      }),
    [orientation, barGap, nrBars, localMaxForColumn, chartDimensions]
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
        margin={{
          ...defaultChartMargins,
          ...(orientation === 'horizontal'
            ? { left: -barGap, right: -barGap }
            : { top: -barGap, bottom: -barGap }),
        }}
        layout={orientation}
        barCategoryGap={barGap}
      >
        <Tooltip
          content={renderTooltip}
          cursor={tooltipCursorStyle(isDarkTheme)}
        />
        {yColumnNames?.map((columnName, i) => {
          const currentColor = colors[i % colors.length].hex;

          return (
            <>
              <Area
                key={`area-${columnName}-${i}`}
                dataKey={columnName}
                legendType="circle"
                type={orientation === 'horizontal' ? 'stepBefore' : 'stepAfter'}
                fill={currentColor}
                stroke={currentColor}
                opacity={0.2}
                strokeWidth={0}
                label={showDataLabel ? renderLabelForFunnel(i) : undefined}
              />
              <Bar
                key={`bar-${columnName}-${i}`}
                dataKey={columnName}
                legendType="circle"
                fill={currentColor}
                radius={radiusFor()}
                label={showDataLabel ? renderBarLabel : undefined}
              />
            </>
          );
        })}

        {orientation === 'horizontal' ? xyAxis : yxAxis}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
