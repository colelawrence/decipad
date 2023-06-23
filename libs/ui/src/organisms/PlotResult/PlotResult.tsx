import { isFlagEnabled } from '@decipad/feature-flags';
import { icons } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useRef } from 'react';
import { VegaLite } from 'react-vega';
import { TextAndIconButton } from '../../atoms';
import { mobileQuery } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { PlotResultProps } from './PlotResult.types';
import { serializeVisualisationSpec } from './serializeVisualisationSpec';
import { usePlotTheme } from './usePlotTheme';

export const PlotResult = ({
  spec,
  data,
  repeatedColumns,
  onError = noop,
}: PlotResultProps): ReturnType<FC> => {
  const chartRef = useRef<HTMLDivElement>(null);

  // For some reason, react-vega seems to add 10px to the width.
  const specObject = serializeVisualisationSpec({
    spec,
    data,
    repeatedColumns,
  });

  const handleExportPNG = () => {
    if (chartRef.current) {
      const canvas = chartRef.current.querySelector('canvas');
      if (canvas) {
        const image = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = 'DecipadChart.png';
        a.href = image;
        a.click();
      }
    }
  };
  return (
    <>
      <div ref={chartRef}>
        <VegaLite
          css={styles}
          renderer="canvas"
          downloadFileName={'DecipadChart'}
          spec={specObject}
          onError={onError}
          actions={false}
          config={usePlotTheme()}
        />
        {isFlagEnabled('DOWNLOAD_CHART') && (
          <button css={hideOnPrint} onClick={handleExportPNG}>
            <TextAndIconButton text="Download chart" iconPosition="left">
              <icons.Download />
            </TextAndIconButton>
          </button>
        )}
      </div>
    </>
  );
};

const styles = css({
  width: '100%',
  height: 365,
  // Couldn't find another way to attach styles to the underlying SVG for responsiveness.
  '& > canvas': {
    maxWidth: '100%',
  },
  [mobileQuery]: {
    height: 225,
  },
});
