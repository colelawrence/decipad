import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { VegaLite } from 'react-vega';
import type { VegaProps } from 'react-vega/lib/Vega';
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
  onError?: VegaProps['onError'];
}

export const PlotResult = ({
  spec,
  data,
  onError = noop,
}: PlotResultProps): ReturnType<FC> => {
  // For some reason, react-vega seems to add 10px to the width.
  const width = slimBlockWidth - 10;
  return (
    <VegaLite
      css={styles}
      renderer="canvas"
      spec={spec}
      data={data}
      width={width}
      height={width / GOLDEN_RATIO}
      onError={onError}
      actions={false}
      config={usePlotTheme()}
    />
  );
};
