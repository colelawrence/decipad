/* eslint-disable complexity */
import { PlotArcVariant } from '@decipad/editor-types';
import {
  offBlack,
  offWhite,
  transparency,
  weakOpacity,
} from 'libs/ui/src/primitives';
import { ReactElement, ReactNode } from 'react';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';
import { BarLabelProps } from '../Charts/types';
import { CustomTooltip, PieLegend } from '../Components';
import { plotBorder, plotTextColor } from '../Components/styles';
import {
  CustomToolTripProps,
  DataEntry,
  DataWithGrowth,
  GrowthData,
  PieLegendProps,
  RechartLabelProps,
  calculateTextWithProps,
} from '../Components/types';

export const domainPadded = ([dataMin, dataMax]: [number, number]): [
  number,
  number
] => {
  const padding = (+dataMax - +dataMin) * 0.05;
  return [Math.floor(+dataMin - padding), Math.ceil(+dataMax + padding)];
};

export const formatNumbersForCharts = (value: number) => {
  if (typeof value === 'number' && Math.abs(value) > 10000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const defaultChartMargins = {
  top: 1,
  right: 1,
  bottom: 1,
  left: 1,
};

export const tooltipLineColor = (isDarkTheme: boolean) =>
  transparency(isDarkTheme ? offWhite : offBlack, weakOpacity).rgba;

export const chartHeight = 365;

export const prettyPercentage = ({
  value,
  total,
}: {
  value: number;
  total: number;
}): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / total);
};

export const renderPieLegend = (opts: PieLegendProps): ReactNode => {
  return <PieLegend {...opts} />;
};

const RADIAN = Math.PI / 180;
export const renderPieLabel =
  (total: number, arcVariant: PlotArcVariant) =>
  ({
    value,
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
  }: PieSectorDataItem) => {
    if (
      !value ||
      innerRadius === undefined ||
      outerRadius === undefined ||
      cx === undefined ||
      cy === undefined ||
      midAngle === undefined
    ) {
      return;
    }

    const position = arcVariant === 'simple' ? 0.65 : 0.5; // 0 in the center, 1 in the line, >1 outside the circle
    const radius = innerRadius + (outerRadius - innerRadius) * position;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = prettyPercentage({ value, total });

    const borderRadius = 6;
    const fontSize = 12;
    const padding = 5;

    const textWidth = calculateTextWidth({ text: '99.99%', fontSize });

    const rectWidth = textWidth + padding * 2;
    const rectHeight = fontSize + padding;
    const rectX = x - rectWidth / 2;
    const rectY = y - rectHeight / 2;

    const svgRect = (
      <g>
        <rect
          x={rectX}
          y={rectY}
          width={rectWidth}
          height={rectHeight}
          fill={plotBorder}
          fillOpacity={0.5}
          rx={borderRadius}
          ry={borderRadius}
        />
        <text
          x={x}
          y={y + padding}
          fill={plotTextColor}
          fontSize={fontSize}
          textAnchor="middle"
        >
          {percentage}
        </text>
      </g>
    );
    return svgRect;
  };

export const renderPieTooltipWithData =
  ({ total, yColumnName }: { total: number; yColumnName: string }) =>
  (opts: Partial<CustomToolTripProps>) => {
    return (
      <CustomTooltip type={'Pie'} {...opts} label={yColumnName} total={total} />
    );
  };

export const renderLineTooltipWithData =
  ({
    tableWithGrowth,
    xColumnName,
    yColumnNames,
  }: {
    xColumnName?: string;
    yColumnNames: string[];
    tableWithGrowth: DataWithGrowth;
  }) =>
  (opts: Partial<CustomToolTripProps>) => {
    let growthData: GrowthData = {};
    if (xColumnName) {
      const companyName = opts.label;
      const companyData = tableWithGrowth.find(
        (data: DataEntry) => data[xColumnName] === companyName
      );

      growthData = yColumnNames.reduce((acc: GrowthData, key) => {
        acc[key] = companyData?.growth?.[key];
        return acc;
      }, {});
    }

    return <CustomTooltip type={'Line'} {...opts} growth={growthData} />;
  };

export const renderScatterTooltip =
  ({ labelColumnName }: { labelColumnName?: string }) =>
  (opts: Partial<CustomToolTripProps>) => {
    return (
      <CustomTooltip
        {...opts}
        type="Scatter"
        labelColumnName={labelColumnName}
      />
    );
  };

export const renderScatterLabel = ({
  width,
  height,
  top = true,
}: RechartLabelProps & { top?: boolean }) => {
  return (props: RechartLabelProps): ReactElement<SVGElement> => {
    const { cx: x, cy: y, value, index } = props;
    if (
      !value ||
      x === undefined ||
      y === undefined ||
      index === undefined ||
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      typeof index !== 'number' ||
      isNaN(x) ||
      isNaN(y) ||
      isNaN(index)
    ) {
      return <></>;
    }
    const prettyValue =
      typeof value === 'number' ? formatNumbersForCharts(value) : value;
    const fontSize = 12;
    const padding = 5;
    const borderRadius = 6;

    const textWidth = calculateTextWidth({ text: prettyValue, fontSize });

    const rectWidth = textWidth + padding * 2;
    const rectHeight = fontSize + padding;
    const sign = top ? 1 : -1;

    let adjustedX = x;
    let adjustedY =
      y +
      sign * (rectHeight / 2 + padding / 2) +
      (sign > 0 ? rectHeight - padding : 0);

    if (x - rectWidth < 0 || y - rectHeight < 0) {
      return <></>;
    }

    if (
      width &&
      height &&
      typeof width === 'number' &&
      typeof height === 'number'
    ) {
      if (x + rectWidth / 2 > width) {
        adjustedX = width - padding - rectWidth / 2;
      }

      if (y + rectHeight / 2 + padding / 2 > height) {
        adjustedY = height - rectHeight / 2 - padding;
      }
    }

    const rectX1 = adjustedX - rectWidth / 2;
    const rectY1 = adjustedY - rectHeight / 2 - padding / 2;

    const svgRect = (
      <g>
        <rect
          x={rectX1}
          y={rectY1}
          width={rectWidth}
          height={rectHeight}
          fill={plotBorder}
          fillOpacity={0.5}
          rx={borderRadius}
          ry={borderRadius}
        />
        <text
          x={adjustedX}
          y={adjustedY}
          fill={plotTextColor}
          fontSize={fontSize}
          textAnchor="middle"
        >
          {prettyValue}
        </text>
      </g>
    );
    return svgRect;
  };
};

export const renderFunnelLabel = ({
  barCategoryGap,
  nrBars,
  width,
  height,
  localMax,
  orientation,
  axisHeight = 30,
}: RechartLabelProps & {
  axisHeight?: number;
  barCategoryGap: number;
  nrBars: number;
  localMax: number;
}) => {
  const posFor = ({ d, nr, i, a = 0 }: { [key: string]: number }) =>
    ((d + a + barCategoryGap * 2) / nr) * i - barCategoryGap;

  return (props: RechartLabelProps): ReactElement<SVGElement> => {
    const { x, y, value, index } = props;

    if (
      !value ||
      x === undefined ||
      width === undefined ||
      height === undefined ||
      y === undefined ||
      index === undefined ||
      index === 0 ||
      typeof width !== 'number' ||
      typeof height !== 'number' ||
      typeof x !== 'number' ||
      typeof y !== 'number'
    ) {
      return <></>;
    }

    const funnelXPositionForIndex = posFor({ d: width, nr: nrBars, i: index });
    const funnelYPositionForIndex = posFor({
      d: height,
      nr: nrBars,
      i: index,
      a: -axisHeight,
    });

    const prettyValue =
      typeof value === 'number' ? toPercent(value / localMax) : value;

    const fontSize = 12;
    const padding = 5;
    const borderRadius = 6;

    const textWidth = calculateTextWidth({ text: prettyValue, fontSize });

    const isVertical = orientation === 'vertical';
    const isHorizontal = !isVertical;
    const rectWidth = textWidth + padding * 2;
    const maxRectWidth =
      calculateTextWidth({ text: '100%', fontSize }) + padding * 2;
    const rectHeight = fontSize + padding;

    if (maxRectWidth > barCategoryGap * 2) {
      return <></>;
    }

    let adjustedX = x;
    let adjustedY = y;

    adjustedX = funnelXPositionForIndex;
    adjustedY = funnelYPositionForIndex;

    const fitInsideX = rectWidth + padding + axisHeight < height - y;
    const fitInsideY = rectHeight + padding + axisHeight < x;

    if (isHorizontal) {
      const middleY = y + rectHeight / 2 + padding;
      adjustedY = fitInsideX ? middleY : y - rectHeight / 2 - padding / 2;
    }

    if (isVertical) {
      const middleX = x / 2;
      adjustedX = fitInsideY ? middleX : x + rectWidth / 2;
    }

    const rectX1 = adjustedX - rectWidth / 2;
    const rectY1 = adjustedY - rectHeight / 2;

    const centerX = rectX1 + rectWidth / 2;
    const centerY = rectY1 + rectHeight / 2;

    const svgRect = (
      <g>
        <rect
          transform={
            isVertical ? `rotate(90, ${centerX}, ${centerY}) ` : undefined
          }
          x={rectX1}
          y={rectY1}
          width={rectWidth}
          height={rectHeight}
          fill={plotBorder}
          fillOpacity={0.5}
          rx={borderRadius}
          ry={borderRadius}
        />
        <text
          x={adjustedX}
          y={adjustedY}
          transform={
            isVertical ? `rotate(90, ${centerX}, ${centerY}) ` : undefined
          }
          dy={fontSize / 2 - padding / 2}
          fill={plotTextColor}
          fontSize={fontSize}
          textAnchor="middle"
        >
          {prettyValue}
        </text>
      </g>
    );

    return svgRect;
  };
};

export const renderLineLabel = ({ width, height }: RechartLabelProps) => {
  return (props: RechartLabelProps): ReactElement<SVGElement> => {
    const { x, y, value, index } = props;
    if (
      !value ||
      x === undefined ||
      y === undefined ||
      index === undefined ||
      typeof x !== 'number' ||
      typeof y !== 'number'
    ) {
      return <></>;
    }
    const prettyValue =
      typeof value === 'number' ? formatNumbersForCharts(value) : value;
    const fontSize = 12;
    const padding = 5;
    const borderRadius = 6;
    const shouldShow = index % 2 === 0;

    if (!shouldShow) {
      return <></>;
    }

    const textWidth = calculateTextWidth({ text: prettyValue, fontSize });

    const rectWidth = textWidth + padding * 2;
    const rectHeight = fontSize + padding;

    let adjustedX = x;
    let adjustedY = y;

    if (x - rectWidth < 0 || y - rectHeight < 0) {
      return <></>; // dont render close to axis
    }

    if (
      width &&
      height &&
      typeof width === 'number' &&
      typeof height === 'number'
    ) {
      if (x + rectWidth / 2 > width) {
        adjustedX = width - padding - rectWidth / 2;
      }

      if (y + rectHeight / 2 + padding / 2 > height) {
        adjustedY = height - rectHeight / 2 - padding;
      }
    }

    const rectX1 = adjustedX - rectWidth / 2;
    const rectY1 = -5 + adjustedY - rectHeight / 2 - padding / 2;

    const svgRect = (
      <g>
        <rect
          x={rectX1}
          y={rectY1}
          width={rectWidth}
          height={rectHeight}
          fill={plotBorder}
          fillOpacity={0.5}
          rx={borderRadius}
          ry={borderRadius}
        />
        <text
          x={adjustedX}
          y={adjustedY}
          dy={-4}
          fill={plotTextColor}
          fontSize={fontSize}
          textAnchor="middle"
        >
          {prettyValue}
        </text>
      </g>
    );
    return svgRect;
  };
};

const calculateTextWidth = ({
  text,
  fontSize,
}: calculateTextWithProps): number => {
  const averageCharWidth = 0.6 * fontSize;
  const width = text.length * averageCharWidth;
  return width;
};

// eslint-disable-next-line complexity
export const calculateLabelPosition = ({
  x,
  y,
  value,
  height,
  width,
  orientation,
  barVariant,
  referenceValue,
}: RechartLabelProps & BarLabelProps) => {
  if (
    !value ||
    x === undefined ||
    y === undefined ||
    height === undefined ||
    width === undefined ||
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    typeof height !== 'number' ||
    typeof width !== 'number'
  ) {
    return null;
  }

  const getPrettyValue = (val: number | string) => {
    return typeof val === 'number'
      ? barVariant === 'stacked100'
        ? toPercent(val)
        : formatNumbersForCharts(val)
      : val;
  };

  const prettyValue = getPrettyValue(value);
  const prettyMaxValue = getPrettyValue(referenceValue);

  const fontSize = 12;
  const padding = 8;
  const minimumBarPadding = 4;
  const hPadding = padding;
  const vPadding = padding / 2;

  const textWidth = calculateTextWidth({ text: prettyValue, fontSize });
  const maxValueRotatedWidth =
    calculateTextWidth({ text: prettyMaxValue, fontSize }) + hPadding;

  const rectWidth = textWidth + hPadding;
  const rectHeight = fontSize + vPadding;

  const isGrouped = barVariant === 'grouped';
  const isVertical = orientation === 'vertical';
  const isHorizontal = !isVertical;
  const rotate = isHorizontal && maxValueRotatedWidth > width;
  const canRender = rotate ? rectHeight < width : rectWidth < width;

  const fitInside = rectWidth + minimumBarPadding < height;

  if ((!isGrouped || isVertical) && rectHeight > height) return null;

  if (!canRender) return null;

  const offsetInside = fitInside ? 1 : -1;

  const yOffset = (rotate ? rectWidth / 2 : rectHeight / 2) + minimumBarPadding;

  const adjustedY =
    y +
    yOffset * offsetInside * (typeof value === 'number' ? Math.sign(value) : 1);

  const barCenterX = x + width / 2;
  const barCenterY = y + height / 2;

  const rectX1 = isVertical
    ? width + x - rectWidth - minimumBarPadding
    : barCenterX - rectWidth / 2;
  const rectY1 = (isVertical ? barCenterY : adjustedY) - rectHeight / 2;

  const textY = (isVertical ? barCenterY : adjustedY) + vPadding;
  const textX = isVertical
    ? width + x - rectWidth / 2 - minimumBarPadding
    : barCenterX;

  const centerX = rectX1 + rectWidth / 2;
  const centerY = rectY1 + rectHeight / 2;

  const output = {
    rectX1,
    rectY1,
    rectWidth,
    rectHeight,
    textY,
    textX,
    centerX,
    centerY,
    rotate,
    fontSize,
    prettyValue,
  };

  return output;
};

export const renderShapeLabel =
  ({ orientation, barVariant, referenceValue }: BarLabelProps) =>
  // eslint-disable-next-line complexity
  (props: RechartLabelProps): ReactElement<SVGElement> => {
    const labelPosition = calculateLabelPosition({
      ...props,
      orientation,
      barVariant,
      referenceValue,
    });

    if (!labelPosition) {
      return <></>;
    }

    const {
      rectX1,
      rectY1,
      rectWidth,
      rectHeight,
      textY,
      textX,
      centerX,
      centerY,
      rotate,
      fontSize,
      prettyValue,
    } = labelPosition;

    const borderRadius = 4;

    const svgRect = (
      <g>
        <rect
          x={rectX1}
          y={rectY1}
          transform={
            rotate ? `rotate(-90, ${centerX}, ${centerY}) ` : undefined
          }
          width={rectWidth}
          height={rectHeight}
          fill={plotBorder}
          fillOpacity={0.5}
          rx={borderRadius}
          ry={borderRadius}
        />
        <text
          transform={
            rotate ? `rotate(-90, ${centerX}, ${centerY}) ` : undefined
          }
          x={textX}
          y={textY}
          fill={plotTextColor}
          fontSize={fontSize}
          textAnchor="middle"
        >
          {prettyValue}
        </text>
      </g>
    );

    return svgRect;
  };

export const calculateGrowth = ({
  table,
  yColumnNames,
}: {
  table: any[];
  yColumnNames: string[];
}) => {
  return table.map((current, index, array) => {
    if (index === 0) {
      const initialGrowth: Record<string, string | undefined> = {};
      yColumnNames.forEach((column) => {
        initialGrowth[column] = undefined;
      });
      return {
        ...current,
        growth: initialGrowth,
      };
    }

    const previous = array[index - 1];
    const growth: Record<string, number | undefined> = {};

    yColumnNames.forEach((column) => {
      growth[column] = previous[column]
        ? Math.round(
            ((current[column] - previous[column]) / previous[column]) * 100
          )
        : undefined;
    });

    return {
      ...current,
      growth,
    };
  });
};

export const toPercent = (decimal: number) => `${(decimal * 100).toFixed(0)}%`;
