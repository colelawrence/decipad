/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, useMemo } from 'react';
import { CellInput } from '../../atoms';
import { ErrorBlock } from '../ErrorBlock/ErrorBlock';
import { captionStyles, captionTextareaStyles } from '../MediaEmbed/styles';
import { PlotParams } from '../PlotParams/PlotParams';
import { PlotResult } from '../PlotResult/PlotResult';
import { initializeVega } from './initializeVega';

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

interface PlotBlockProps {
  readOnly?: boolean;
  errorMessage?: string;
  plotParams: ComponentProps<typeof PlotParams>;
  result?: ComponentProps<typeof PlotResult>;
  title?: string;
  onTitleChange?: (newValue: string) => void;
}

export const PlotBlock = ({
  readOnly = false,
  errorMessage,
  plotParams,
  result,
  title,
  onTitleChange = noop,
}: PlotBlockProps): ReturnType<FC> => {
  const caption = useMemo(() => title || '', [title]);
  initializeVega();
  const hasOptions = plotParams.sourceVarNameOptions.length > 0;
  const displayError = useMemo(
    () => (!plotParams.sourceVarName && !readOnly) || errorMessage,
    [errorMessage, plotParams.sourceVarName, readOnly]
  );
  const errorDisplay = (
    <ErrorBlock
      type={errorMessage ? 'error' : 'info'}
      message={
        errorMessage ||
        (hasOptions
          ? 'Please select a table to base the chart on'
          : "You can't create a chart because this document does not include any tables. Please delete this block and try again when you have a table.")
      }
    />
  );
  return (
    <section
      data-test-id="chart-styles"
      css={plotBlockStyles}
      contentEditable={false}
    >
      <div css={{ position: 'relative' }}>
        {!readOnly && (!displayError || hasOptions) && (
          <div css={plotTitleStyles}>
            <PlotParams {...plotParams} />
          </div>
        )}
        {displayError
          ? errorDisplay
          : result && (
              <output css={plotStyles}>
                <PlotResult {...result} />
              </output>
            )}
      </div>

      {!displayError && (
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
      )}
    </section>
  );
};
