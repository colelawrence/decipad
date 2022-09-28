import { noop } from '@decipad/utils';
import { dequal } from 'dequal';
import { FC, useState, useEffect } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { VegaLite } from 'react-vega';
import type { VegaProps } from 'react-vega/lib/Vega';

const GOLDEN_RATIO = 1.618;
// by experience, this is the maximum value in pixels added to the width of a chart
// to accommodate the labels on the right.
const SUBTRACT_MARGIN = 100;

interface PlotResultProps {
  spec: NonNullable<VegaProps['spec']>;
  data: NonNullable<VegaProps['data']>;
  onError?: VegaProps['onError'];
}

interface Size {
  width?: number;
  height?: number;
}

const SIZE_QUANTUM_LEAP = 20;

const quantumSize = (size: Size): Size => {
  let width = (size.width || 600) - SUBTRACT_MARGIN;
  width -= width % SIZE_QUANTUM_LEAP;
  width = Math.round(width);
  const height = Math.round(width / GOLDEN_RATIO);
  return { width, height };
};

export const PlotResult = ({
  spec,
  data,
  onError = noop,
}: PlotResultProps): ReturnType<FC> => {
  const size = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 1000,
  });
  const [actualSize, setActualSize] = useState<Size | undefined>();
  useEffect(() => {
    const newSize = quantumSize(size);
    if (!dequal(newSize, actualSize)) {
      setActualSize(newSize);
    }
  }, [actualSize, size]);

  return (
    (actualSize && actualSize.width != null && actualSize.height != null && (
      <div ref={size.ref}>
        <VegaLite
          renderer="svg"
          spec={spec}
          data={data}
          width={actualSize.width}
          height={actualSize.height}
          onError={onError}
          actions={false}
        />
      </div>
    )) ||
    null
  );
};
