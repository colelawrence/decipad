import { PlainObject, VisualizationSpec } from 'react-vega';
import { Field } from 'vega-lite/build/src/channeldef';
import { InlineData } from 'vega-lite/build/src/data';
import { LayerSpec } from 'vega-lite/build/src/spec';
import { LayerRepeatMapping } from 'vega-lite/build/src/spec/repeat';
import { PlotSpec } from './PlotResult.types';

interface SerializeVisualisationSpecProps {
  readonly data: PlainObject;
  readonly repeatedColumns: string[] | undefined;
  readonly spec: NonNullable<PlotSpec>;
}

export const serializeVisualisationSpec = ({
  data,
  repeatedColumns,
  spec,
}: SerializeVisualisationSpecProps): VisualizationSpec => {
  const hasMoreThanOneDimension = (repeatedColumns || []).length > 1;
  const repeat = hasMoreThanOneDimension
    ? {
        repeat: {
          layer: repeatedColumns,
        } as LayerRepeatMapping,
      }
    : {};

  const innerColor = {
    color: {
      ...(spec.encoding?.color || {}),
      legend: {
        orient: 'bottom',
        direction: 'horizontal',
        ...(spec.encoding?.color?.legend || {}),
      },
    },
  };

  const { color, ...specEncodingNoColor } = spec.encoding || {};
  const specInside = {
    ...spec,
    encoding: {
      ...specEncodingNoColor,
      ...innerColor,
    },
  };

  const innerSpec = hasMoreThanOneDimension
    ? ({ spec: specInside } as any)
    : (specInside as LayerSpec<Field>);

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      values: data.table,
    } as InlineData,
    width: 'container',
    height: 'container',
    view: { stroke: 'transparent' },
    ...repeat,
    ...innerSpec,
  };
};
