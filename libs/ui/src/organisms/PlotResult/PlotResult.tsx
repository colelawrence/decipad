import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import type { VegaProps } from 'react-vega/lib/Vega';
import { InlineData } from 'vega-lite/build/src/data';
import { LayerSpec } from 'vega-lite/build/src/spec';
import { Field } from 'vega-lite/build/src/channeldef';
import { LayerRepeatMapping } from 'vega-lite/build/src/spec/repeat';
import { slimBlockWidth } from '../../styles/editor-layout';
import { usePlotTheme } from './usePlotTheme';

const styles = css({
  // Couldn't find another way to attach styles to the underlying SVG for responsiveness.
  '& > svg': {
    maxWidth: '100%',
  },
});

const GOLDEN_RATIO = 1.618;

type SpecConfig = VegaProps['spec']['config'];

type Spec = VegaProps['spec'] & {
  config: SpecConfig & { encoding: { color: { scheme: string | undefined } } };
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
  // For some reason, react-vega seems to add 10px to the width.
  const width = slimBlockWidth - 10;
  const specObject: VisualizationSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      values: data.table,
    } as InlineData,
    repeat: (repeatedColumns
      ? { layer: repeatedColumns }
      : undefined) as LayerRepeatMapping,
    spec: spec as LayerSpec<Field>,
  };

  return (
    <VegaLite
      css={styles}
      renderer="canvas"
      spec={specObject}
      width={width}
      height={width / GOLDEN_RATIO}
      onError={onError}
      actions={false}
      config={usePlotTheme()}
    />
  );
};
