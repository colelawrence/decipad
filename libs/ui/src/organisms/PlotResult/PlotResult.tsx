import { isFlagEnabled } from '@decipad/feature-flags';
import { icons } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useRef } from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import type { VegaProps } from 'react-vega/lib/Vega';
import { Field } from 'vega-lite/build/src/channeldef';
import { InlineData } from 'vega-lite/build/src/data';
import { LayerSpec } from 'vega-lite/build/src/spec';
import { LayerRepeatMapping } from 'vega-lite/build/src/spec/repeat';
import { TextAndIconButton } from '../../atoms';
import { mobileQuery } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { usePlotTheme } from './usePlotTheme';

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

type SpecConfig = VegaProps['spec']['config'];

type Spec = VegaProps['spec'] & {
  config: SpecConfig & { encoding?: { color: { scheme: string | undefined } } };
  encoding?: { color: { field: string | undefined; type: string | undefined } };
};

interface PlotResultProps {
  spec: NonNullable<Spec>;
  data: NonNullable<VegaProps['data']>;
  repeatedColumns?: string[];
  onError?: VegaProps['onError'];
}

export const PlotResult = ({
  spec,
  data,
  repeatedColumns,
  onError = noop,
}: PlotResultProps): ReturnType<FC> => {
  const chartRef = useRef<HTMLDivElement>(null);

  // For some reason, react-vega seems to add 10px to the width.
  const specObject: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      values: data.table,
    } as InlineData,
    width: 'container',
    height: 'container',
    view: { stroke: 'transparent' },
    repeat: (repeatedColumns
      ? { layer: repeatedColumns }
      : undefined) as LayerRepeatMapping,
    spec: {
      ...spec,
      encoding: {
        ...(spec.encoding || {}),

        color: {
          ...(spec.encoding?.color || {}),
          legend: {
            orient: 'bottom',
            direction: 'horizontal',
          },
        },
      },
    } as LayerSpec<Field>,
  };

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
