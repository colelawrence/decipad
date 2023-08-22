/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useMemo } from 'react';
import { CellInput } from '../../atoms';
import { captionStyles, captionTextareaStyles } from '../MediaEmbed/styles';
import { PlotParams } from '../PlotParams/PlotParams';
import { PlotResult } from '../PlotResult/PlotResult';
import { initializeVega } from './initializeVega';
import { cssVar } from '../../primitives';

const plotTitleStyles = css({
  position: 'absolute',
  zIndex: 9,
  right: 18,
  top: 18,
  button: {
    float: 'right',
  },
});

const plotBlockStyles = css({
  display: 'grid',
});

const plotStyles = css({
  alignSelf: 'center',
});

const emptyChartStyles = css({
  height: '100px',
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: '8px',
  padding: '16px 48px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

interface PlotBlockProps {
  readOnly?: boolean;
  plotParams: ComponentProps<typeof PlotParams>;
  result?: ComponentProps<typeof PlotResult>;
  title?: string;
  onTitleChange?: (newValue: string) => void;
}

export const PlotBlock = ({
  readOnly = false,
  plotParams,
  result,
  title,
  onTitleChange = noop,
}: PlotBlockProps): ReturnType<FC> => {
  const caption = useMemo(() => title || '', [title]);
  initializeVega();
  const hasOptions = plotParams.sourceVarNameOptions.length > 0;

  return (
    <section
      data-testid="chart-styles"
      className={'block-p'}
      css={plotBlockStyles}
      contentEditable={false}
    >
      <div css={{ position: 'relative' }}>
        {!readOnly && (
          <div css={plotTitleStyles}>
            <PlotParams {...plotParams} />
          </div>
        )}
        {result && (
          <output css={plotStyles}>
            <PlotResult {...result} />
          </output>
        )}
      </div>

      {(!plotParams.sourceVarName || !result) && (
        <div css={emptyChartStyles}>
          {hasOptions ? (
            <span>Please select a table to base this chart on.</span>
          ) : (
            <span>
              It seems you don't have any tables to base this chart on. Create
              some tables and try again.
            </span>
          )}
        </div>
      )}

      <div
        css={[
          captionStyles,
          { input: captionTextareaStyles },
          { input: { fontVariantNumeric: 'unset' } },
        ]}
      >
        {(readOnly && caption === '') ||
        !plotParams.sourceVarName ? undefined : (
          <CellInput
            value={caption}
            readOnly={readOnly}
            onChange={onTitleChange}
            placeholder="Chart caption"
          />
        )}
      </div>
    </section>
  );
};
