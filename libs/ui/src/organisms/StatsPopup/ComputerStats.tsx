import { FC, useMemo } from 'react';
import { ComputerExpressionResultStat, ComputerStat } from '@decipad/computer';
import { PlotResult, PlotSpec } from '../PlotResult/PlotResult';

export interface StatsGraphProps {
  computerRequestStatSamples: ComputerStat[];
  computerExpressionResultStatSamples: ComputerExpressionResultStat[];
}

const computerRequestStatColumns: Array<keyof ComputerStat> = [
  'inferStatementCount',
  'inferExpressionCount',
  'evaluateCount',
  'evaluateStatementCount',
];

export const ComputerStats: FC<StatsGraphProps> = ({
  computerRequestStatSamples,
  computerExpressionResultStatSamples,
}) => {
  const specElapsed = useMemo(
    (): PlotSpec => ({
      data: {
        values: computerRequestStatSamples,
      },
      mark: { type: 'line', tooltip: { content: 'data' } },
      encoding: {
        x: {
          field: '_id',
          type: 'ordinal',
        },
        y: {
          field: 'fullRequestElapsedTimeMs',
          type: 'quantitative',
        },
      },
    }),
    [computerRequestStatSamples]
  );

  const specOther = useMemo(
    (): PlotSpec => ({
      data: {
        values: computerRequestStatSamples,
      },
      mark: { type: 'bar', tooltip: { content: 'data' } },
      encoding: {
        x: {
          field: '_id',
          type: 'ordinal',
        },
        y: {
          field: { repeat: 'layer' },
          type: 'quantitative',
        },
        color: {
          datum: { repeat: 'layer' },
          title: 'Computer request',
          legend: {
            orient: 'top-right',
            direction: 'vertical',
          },
        },
        xOffset: { datum: { repeat: 'layer' } },
      },
    }),
    [computerRequestStatSamples]
  );

  const specExpressionResultElapsed = useMemo(
    (): PlotSpec => ({
      data: {
        values: computerExpressionResultStatSamples,
      },
      mark: { type: 'line', tooltip: { content: 'data' } },
      encoding: {
        x: {
          field: '_id',
          type: 'ordinal',
        },
        y: {
          field: 'expressionResultElapsedTimeMs',
          type: 'quantitative',
        },
      },
    }),
    [computerExpressionResultStatSamples]
  );

  const computerRequestData = useMemo(
    () => ({
      values: computerRequestStatSamples,
    }),
    [computerRequestStatSamples]
  );

  const computerExpressionResultData = useMemo(
    () => ({
      values: computerExpressionResultStatSamples,
    }),
    [computerExpressionResultStatSamples]
  );

  return (
    <div>
      <h3>Request to results:</h3>
      <PlotResult
        repeatedColumns={computerRequestStatColumns}
        spec={specElapsed}
        data={computerRequestData}
      />
      <PlotResult
        repeatedColumns={computerRequestStatColumns}
        spec={specOther}
        data={computerRequestData}
      />

      <h3>Expression results:</h3>

      <PlotResult
        repeatedColumns={['expressionResultElapsedTimeMs']}
        spec={specExpressionResultElapsed}
        data={computerExpressionResultData}
      />
    </div>
  );
};
