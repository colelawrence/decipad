import { useEffect, useRef, useState } from 'react';
import { LabelProps, XAxis, YAxis } from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';
import { chartAxisFontStyles } from '../Charts/styles';
import { chartHeight, domainPadded, formatNumbersForCharts } from '../helpers';
import { EditableAxisLabel } from './EditableAxisLabel';
import { AxisProps } from './types';

export const propsForAllAxis = {
  style: chartAxisFontStyles,
  axisLine: false,
  tickLine: false,
};

export const propsForMirroredAxis = ({
  xAxisOffset = 0,
  yAxisOffset = 0,
}: {
  xAxisOffset?: number;
  yAxisOffset?: number;
}) => ({
  mirror: true,
  dy: -10 + yAxisOffset,
  dx: xAxisOffset,
  orientation: 'right' as const,
});

export const propsForReversedYAxis = ({ reverseY }: { reverseY: boolean }) => ({
  orientation: reverseY ? ('left' as const) : ('right' as const),
  reversed: reverseY,
});

export const propsForReversedXAxis = ({ reverseY }: { reverseY: boolean }) => ({
  reversed: reverseY,
});

export const propsForNumberAxis = ({
  tickFormatter,
  startFromZero,
}: Pick<AxisProps, 'startFromZero' | 'tickFormatter'>) => ({
  tickFormatter: tickFormatter || formatNumbersForCharts,
  domain: startFromZero
    ? ([0, 'auto'] as AxisDomain)
    : ([dataMin, dataMax]: [number, number]) =>
        domainPadded([dataMin, dataMax]),
});

export const renderAxisLabel =
  ({
    axisLabel,
    setAxisLabel,
    yAxis = false,
    isExporting,
    labelBox,
  }: {
    axisLabel?: string;
    yAxis?: boolean;
    isExporting?: boolean;
    labelBox?: { height: number; left: number; top: number };
    setAxisLabel?: (label: string) => void;
  }) =>
  // eslint-disable-next-line complexity
  ({ x, y, viewBox }: LabelProps) => {
    const [textWidth, setTextWidth] = useState(0);
    const [inputValue, setInputValue] = useState(axisLabel);

    const textRef = useRef<SVGTextElement>(null);

    useEffect(() => {
      if (textRef.current) {
        setTextWidth(textRef.current.getComputedTextLength());
      }
    }, [inputValue]);

    if (labelBox) {
      return (
        <EditableAxisLabel
          foreignObjectX={labelBox.left}
          foreignObjectY={labelBox.top}
          foreignObjectWidth={labelBox.height}
          foreignObjectHeight={labelBox.height}
          textX={labelBox.left}
          textY={labelBox.top}
          textHeight={labelBox.height}
          textWidth={textWidth}
          text={axisLabel}
          yAxis={yAxis}
          onTextChange={setAxisLabel}
          isExporting={isExporting}
          inputValue={inputValue}
          setInputValue={setInputValue}
          textRef={textRef}
        />
      );
    }

    let adjustedX = 5;
    let adjustedY = -5;

    if (typeof x === 'number' && typeof y === 'number') {
      adjustedX += x;
      adjustedY += y;
    } else if (
      viewBox &&
      'x' in viewBox &&
      'y' in viewBox &&
      typeof viewBox.x === 'number' &&
      typeof viewBox.y === 'number'
    ) {
      adjustedX += viewBox.x;
      adjustedY += viewBox.y;
    } else {
      adjustedY += chartHeight - 50;
    }

    const foreignObjectWidth = 300;
    const foreignObjectHeight = 50;

    const yOffset = yAxis ? 20 : 0;
    const xOffset = yAxis ? -foreignObjectWidth : 0;
    const xOffset2 = yAxis ? 45 : 0;
    const inputOffset = -28;
    const foreignObjectX = adjustedX + xOffset + xOffset2;
    const foreignObjectY = adjustedY + inputOffset + yOffset;
    const textX = adjustedX + (yAxis ? -textWidth : 0) + xOffset2;
    const textY = adjustedY + yOffset;

    return (
      <EditableAxisLabel
        foreignObjectX={foreignObjectX}
        foreignObjectY={foreignObjectY}
        foreignObjectWidth={foreignObjectWidth}
        foreignObjectHeight={foreignObjectHeight}
        textX={textX}
        textY={textY}
        text={axisLabel}
        yAxis={yAxis}
        onTextChange={setAxisLabel}
        isExporting={isExporting}
        inputValue={inputValue}
        setInputValue={setInputValue}
        textRef={textRef}
      />
    );
  };

export const horizontalAxis = ({
  startFromZero,
  xColumnName,
  tickFormatter,
  customTick,
  xAxisOffset = 0,
  yAxisOffset = 0,
  xAxisLabel,
  setXAxisLabel,
  yAxisLabel,
  setYAxisLabel,
  isExporting,
  reverseY = false,
}: AxisProps) => [
  <XAxis
    key="x-axis"
    type="category"
    label={renderAxisLabel({
      axisLabel: xAxisLabel,
      setAxisLabel: setXAxisLabel,
      isExporting,
    })}
    dataKey={xColumnName}
    {...propsForAllAxis}
  />,
  <YAxis
    key="y-axis"
    type="number"
    label={renderAxisLabel({
      axisLabel: yAxisLabel,
      setAxisLabel: setYAxisLabel,
      isExporting,
      yAxis: true,
    })}
    {...propsForReversedYAxis({ reverseY })}
    {...propsForMirroredAxis({ xAxisOffset, yAxisOffset })}
    {...propsForNumberAxis({ tickFormatter, startFromZero })}
    {...propsForAllAxis}
    tick={customTick}
  />,
];

export const verticalAxis = ({
  startFromZero,
  xColumnName,
  tickFormatter,
  customTick,
  xAxisOffset = 0,
  yAxisOffset = 0,
  xAxisLabel,
  setXAxisLabel,
  yAxisLabel,
  setYAxisLabel,
  isExporting,
  reverseY = false,
}: AxisProps) => [
  <XAxis
    key="x-axis"
    type="number"
    dx={xAxisOffset}
    dy={yAxisOffset}
    label={renderAxisLabel({
      axisLabel: xAxisLabel,
      setAxisLabel: setXAxisLabel,
      isExporting,
    })}
    {...propsForReversedXAxis({ reverseY })}
    {...propsForNumberAxis({ tickFormatter, startFromZero })}
    {...propsForAllAxis}
  />,
  <YAxis
    key="y-axis"
    type="category"
    dataKey={xColumnName}
    label={renderAxisLabel({
      axisLabel: yAxisLabel,
      setAxisLabel: setYAxisLabel,
      isExporting,
      yAxis: true,
    })}
    {...propsForMirroredAxis({})}
    {...propsForAllAxis}
    tick={customTick}
  />,
];
