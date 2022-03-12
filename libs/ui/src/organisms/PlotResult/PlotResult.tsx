import { noop } from '@decipad/utils';
import { FC } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { VegaLite } from 'react-vega';
import type { VegaProps } from 'react-vega/lib/Vega';

const GOLDEN_RATIO = 1.618;
// by experience, this is the maximum value in pixels added to the width of a chart
// to accomodate the labels on the right.
const SUBTRACT_MARGIN = 230;

interface PlotResultProps {
  spec: NonNullable<VegaProps['spec']>;
  data: NonNullable<VegaProps['data']>;
  onError?: VegaProps['onError'];
}

export const PlotResult = ({
  spec,
  data,
  onError = noop,
}: PlotResultProps): ReturnType<FC> => {
  const size = useResizeDetector({
    handleHeight: false,
  });

  // The margin to subtract was inferred by experience of using Vega
  // with this configuration
  const width = (size.width || 600) - SUBTRACT_MARGIN;
  const height = Math.round(width / GOLDEN_RATIO);
  return (
    <div ref={size.ref}>
      <VegaLite
        renderer="svg"
        spec={spec}
        data={data}
        width={width}
        height={height}
        onError={onError}
        actions={false}
      />
    </div>
  );
};
