/* eslint-disable complexity */
import { PlotDefaultColorScheme } from '@decipad/editor-types';
import { FC, useMemo } from 'react';
import {
  AreaChart,
  BarChart,
  ComboChart,
  FunnelChart,
  LineChart,
  NoDataChart,
  PieChart,
  RadarChart,
  ScatterChart,
} from './Charts';

import { PlotResultProps } from './PlotResult.types';

const aggregateData = (
  data: any[],
  xColumnName: string,
  yColumnNames: string[]
): any[] => {
  const aggregatedData = data.reduce(
    (acc: { [key: string]: any }, item: any) => {
      const key = item[xColumnName];
      if (!acc[key]) {
        acc[key] = { [xColumnName]: key };
        yColumnNames.forEach((yColumnName) => {
          acc[key][yColumnName] = 0;
        });
      }
      yColumnNames.forEach((yColumnName) => {
        acc[key][yColumnName] += +item[yColumnName];
      });
      return acc;
    },
    {}
  );

  return Object.values(aggregatedData);
};

export const PlotResult = ({
  data,
  markType,
  sizeColumnName,
  xColumnName,
  xAxisLabel,
  yAxisLabel,
  setXAxisLabel,
  setYAxisLabel,
  labelColumnName,
  orientation,
  grid,
  startFromZero,
  mirrorYAxis,
  groupByX,
  yColumnNames,
  yColumnChartTypes,
  barVariant,
  lineVariant,
  arcVariant,
  showDataLabel,
  isExporting,
  colorScheme = PlotDefaultColorScheme,
}: PlotResultProps): ReturnType<FC> => {
  const processedData = useMemo(() => {
    return data && data.table && xColumnName && yColumnNames
      ? aggregateData(data.table, xColumnName, yColumnNames)
      : data
      ? data.table
      : [];
  }, [data, xColumnName, yColumnNames]);

  if (
    !xColumnName ||
    !Array.isArray(yColumnNames) ||
    yColumnNames.length === 0 ||
    !data
  ) {
    return <NoDataChart />;
  }

  let chart = <></>;
  switch (markType) {
    case 'radar':
      chart = (
        <RadarChart
          table={groupByX ? processedData : data.table}
          xColumnName={xColumnName}
          yColumnNames={yColumnNames}
          colorScheme={colorScheme}
          grid={grid}
          isExporting={isExporting}
        />
      );
      break;
    case 'funnel':
      chart = (
        <FunnelChart
          table={processedData}
          xColumnName={xColumnName}
          yColumnNames={yColumnNames}
          orientation={orientation}
          colorScheme={colorScheme}
          showDataLabel={showDataLabel}
          mirrorYAxis={mirrorYAxis}
          isExporting={isExporting}
        />
      );
      break;
    case 'arc':
      chart = (
        <PieChart
          table={groupByX ? processedData : data.table}
          xColumnName={xColumnName}
          yColumnNames={yColumnNames}
          colorScheme={colorScheme}
          arcVariant={arcVariant || 'simple'}
          showDataLabel={showDataLabel || false}
          isExporting={isExporting}
          xAxisLabel={xAxisLabel}
          setXAxisLabel={setXAxisLabel}
        />
      );
      break;
    case 'line':
      if (lineVariant === 'area') {
        chart = (
          <AreaChart
            table={groupByX ? processedData : data.table}
            xColumnName={xColumnName}
            orientation={orientation}
            yColumnNames={yColumnNames}
            colorScheme={colorScheme}
            grid={grid}
            startFromZero={startFromZero}
            lineVariant={lineVariant}
            showDataLabel={showDataLabel}
            stackOffset="none"
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
            setXAxisLabel={setXAxisLabel}
            setYAxisLabel={setYAxisLabel}
            isExporting={isExporting}
          />
        );
      } else if (lineVariant === 'area100') {
        chart = (
          <AreaChart
            table={groupByX ? processedData : data.table}
            xColumnName={xColumnName}
            yColumnNames={yColumnNames}
            orientation={orientation}
            colorScheme={colorScheme}
            grid={grid}
            startFromZero={startFromZero}
            lineVariant={lineVariant}
            showDataLabel={showDataLabel}
            stackOffset="expand"
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
            setXAxisLabel={setXAxisLabel}
            setYAxisLabel={setYAxisLabel}
            isExporting={isExporting}
          />
        );
      } else {
        chart = (
          <LineChart
            table={groupByX ? processedData : data.table}
            xColumnName={xColumnName}
            yColumnNames={yColumnNames}
            orientation={orientation}
            colorScheme={colorScheme}
            grid={grid}
            startFromZero={startFromZero}
            showDataLabel={showDataLabel || false}
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
            setXAxisLabel={setXAxisLabel}
            setYAxisLabel={setYAxisLabel}
            isExporting={isExporting}
          />
        );
      }

      break;
    case 'combo':
      chart = (
        <ComboChart
          table={groupByX ? processedData : data.table}
          xColumnName={xColumnName}
          yColumnNames={yColumnNames}
          yColumnChartType={yColumnChartTypes}
          orientation={orientation}
          colorScheme={colorScheme}
          grid={grid}
          startFromZero={startFromZero}
          showDataLabel={showDataLabel || false}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          setXAxisLabel={setXAxisLabel}
          setYAxisLabel={setYAxisLabel}
          isExporting={isExporting}
        />
      );
      break;
    case 'point':
      chart = (
        <ScatterChart
          table={data.table}
          xColumnName={xColumnName}
          yColumnNames={yColumnNames}
          orientation={orientation}
          colorScheme={colorScheme}
          grid={grid}
          startFromZero={startFromZero}
          labelColumnName={labelColumnName}
          sizeColumnName={sizeColumnName}
          showDataLabel={showDataLabel || false}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          setXAxisLabel={setXAxisLabel}
          setYAxisLabel={setYAxisLabel}
          isExporting={isExporting}
        />
      );
      break;
    case 'area':
      chart = (
        <AreaChart
          table={groupByX ? processedData : data.table}
          xColumnName={xColumnName}
          yColumnNames={yColumnNames}
          orientation={orientation}
          colorScheme={colorScheme}
          grid={grid}
          startFromZero={startFromZero}
          showDataLabel={showDataLabel}
          lineVariant={'area'}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          setXAxisLabel={setXAxisLabel}
          setYAxisLabel={setYAxisLabel}
          isExporting={isExporting}
        />
      );
      break;
    case 'bar':
      chart = (
        <BarChart
          table={groupByX ? processedData : data.table}
          xColumnName={xColumnName}
          yColumnNames={yColumnNames}
          orientation={orientation}
          colorScheme={colorScheme}
          grid={grid}
          startFromZero={startFromZero}
          showDataLabel={showDataLabel}
          barVariant={barVariant}
          xAxisLabel={xAxisLabel}
          yAxisLabel={yAxisLabel}
          setXAxisLabel={setXAxisLabel}
          setYAxisLabel={setYAxisLabel}
          isExporting={isExporting}
        />
      );
      break;
  }

  return chart;
};
