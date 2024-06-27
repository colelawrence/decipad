import { noop } from '@decipad/utils';
import { FC, useMemo } from 'react';
import { CellInput } from '../CellInput/CellInput';
import { PlotParams } from '../PlotParams/PlotParams';
import { PlotResult } from '../PlotResult/PlotResult';
import {
  cellInputStyles,
  plotBlockStyles,
  plotStyles,
  plotTitleStyles,
  positionRelative,
} from './styles';
import { PlotBlockProps } from './types';

export const PlotBlock = ({
  readOnly = false,
  plotParams,
  result,
  title,
  onTitleChange = noop,
  chartUuid,
}: PlotBlockProps): ReturnType<FC> => {
  const caption = useMemo(() => title || '', [title]);
  const noAxis = useMemo(
    () => !!plotParams.xColumnName && plotParams.yColumnNames.length > 0,
    [plotParams.xColumnName, plotParams.yColumnNames.length]
  );
  const canRenderChart = useMemo(
    () => plotParams.sourceVarName && result && noAxis,
    [noAxis, plotParams.sourceVarName, result]
  );

  return (
    <section
      data-testid="chart-styles"
      aria-label="column-content"
      className={'block-p'}
      css={plotBlockStyles}
      contentEditable={false}
    >
      <div css={positionRelative}>
        {!readOnly && (
          <div css={plotTitleStyles}>
            <PlotParams {...plotParams} />
          </div>
        )}

        <output css={plotStyles} id={chartUuid}>
          <PlotResult {...result} {...plotParams} isExporting={readOnly} />
        </output>
      </div>

      <div css={cellInputStyles}>
        {(readOnly && caption === '') || !canRenderChart ? undefined : (
          <CellInput
            value={caption}
            readOnly={readOnly}
            onChange={onTitleChange}
            placeholder="Add a caption to this chart"
          />
        )}
      </div>
    </section>
  );
};
