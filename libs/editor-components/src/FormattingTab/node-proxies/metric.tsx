import {
  MyEditor,
  ELEMENT_METRIC,
  MetricElement,
  NumberFormatting,
} from '@decipad/editor-types';
import {
  MultipleNodeProxyProperty,
  createMultipleNodeProxyFactory,
  ifVaries,
  mapProperty,
  withDefault,
} from '../proxy';
import { setNodeProperty } from './utils';
import { ProxyFactoryConfig, ProxyFormProps } from './types';
import { FC } from 'react';
import { FormWrapper } from '../FormWrapper';
import {
  ColorOption,
  ColorOptionWithTrend,
  ProxyColorDropdownField,
  ProxyDropdownField,
  ProxyStringField,
  ProxyTrendColorDropdownField,
} from '../proxy-fields';
import { ProxyVariableDropdownField } from '../proxy-fields/ProxyVariableDropdownField';
import { SerializedType } from '@decipad/language-interfaces';
import { css } from '@emotion/react';
import {
  AggregationType,
  availableAggregations,
  getAggregationShortName,
} from '@decipad/language-aggregations';
import { Button } from '@decipad/ui';
import { Trash } from 'libs/ui/src/icons';
import { capitalize } from 'lodash';
import { useMetricAggregation } from '@decipad/editor-hooks';

export const metricConfig = {
  key: 'metric' as const,
  match: { type: ELEMENT_METRIC },
  factory: createMultipleNodeProxyFactory({
    mapProperties: (node: MetricElement) => ({
      caption: node.caption,
      blockId: node.blockId,
      aggregation: node.aggregation,
      comparisonBlockId: node.comparisonBlockId,
      comparisonAggregation: node.comparisonAggregation,
      comparisonDescription: node.comparisonDescription,
      formatting: node.formatting,
      color: node.color ?? 'auto',
      trendColor: node.trendColor ?? 'trend',
    }),
    actions: {
      setCaption: (node: MetricElement, editor: MyEditor, caption: string) =>
        setNodeProperty(editor, node, 'caption', caption),
      setBlockId: (node: MetricElement, editor: MyEditor, blockId: string) =>
        setNodeProperty(editor, node, 'blockId', blockId),
      setAggregation: (
        node: MetricElement,
        editor: MyEditor,
        aggregation: string
      ) => setNodeProperty(editor, node, 'aggregation', aggregation),
      setComparisonBlockId: (
        node: MetricElement,
        editor: MyEditor,
        blockId: string
      ) => setNodeProperty(editor, node, 'comparisonBlockId', blockId),
      setComparisonAggregation: (
        node: MetricElement,
        editor: MyEditor,
        aggregation: string
      ) => setNodeProperty(editor, node, 'comparisonAggregation', aggregation),
      setComparisonDescription: (
        node: MetricElement,
        editor: MyEditor,
        comparisonDescription: string
      ) =>
        setNodeProperty(
          editor,
          node,
          'comparisonDescription',
          comparisonDescription
        ),
      setFormatting: (node, editor: MyEditor, formatting: NumberFormatting) =>
        setNodeProperty(editor, node, 'formatting', formatting),
      setColor: (node: MetricElement, editor: MyEditor, color: ColorOption) =>
        setNodeProperty(editor, node, 'color', color),
      setTrendColor: (
        node: MetricElement,
        editor: MyEditor,
        color: ColorOptionWithTrend
      ) => setNodeProperty(editor, node, 'trendColor', color),
    },
  }),
} satisfies ProxyFactoryConfig<any, any>;

const allowedKinds: SerializedType['kind'][] = [
  'number',
  'string',
  'boolean',
  'trend',
];

const allowedColumnKinds = allowedKinds.filter(
  (kind) => availableAggregations(kind).length > 0
);

const filterMetricType = (serializedType: SerializedType) => {
  if (allowedKinds.includes(serializedType.kind)) return true;
  if (
    serializedType.kind === 'column' &&
    allowedColumnKinds.includes(serializedType.cellType.kind)
  )
    return true;
  return false;
};

// Visible only to screen-readers but still takes up space
const invisibleText = css({
  opacity: 0,
  userSelect: 'none',
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
});

interface MetricValueFieldProps {
  editor: MyEditor;
  label: string;
  showNoneOption?: boolean;
  blockIdProperty: MultipleNodeProxyProperty<string>;
  aggregationIdProperty: MultipleNodeProxyProperty<string>;
  aggregationOptions: AggregationType[];
  onSetBlockId: (editor: MyEditor, blockId: string) => void;
  onSetAggregationId: (editor: MyEditor, aggregationId: string) => void;
}

const MetricValueField = ({
  editor,
  label,
  showNoneOption = false,
  blockIdProperty,
  aggregationIdProperty,
  aggregationOptions,
  onSetBlockId,
  onSetAggregationId,
}: MetricValueFieldProps) => {
  return (
    <div
      css={{
        display: 'flex',
        gap: 4,
      }}
    >
      <div css={{ flexGrow: 1 }}>
        <ProxyVariableDropdownField
          editor={editor}
          filterType={filterMetricType}
          label={label}
          placeholder="Choose value..."
          property={blockIdProperty}
          onChange={onSetBlockId}
        />
      </div>

      {aggregationOptions.length > 0 && (
        <div css={{ width: 95 }}>
          <ProxyDropdownField
            editor={editor}
            label={<span css={invisibleText}>Aggregation</span>}
            property={aggregationIdProperty}
            onChange={onSetAggregationId}
            options={aggregationOptions.map(({ id }) => id)}
            labelForValue={(id) => getAggregationShortName(id) ?? ''}
          />
        </div>
      )}

      {showNoneOption && ifVaries(blockIdProperty, true) && (
        <div css={{ alignSelf: 'end' }}>
          <Button
            size="square"
            type="ghost"
            onClick={() => onSetBlockId(editor, '')}
          >
            <div css={{ width: 16, height: 16, display: 'grid' }}>
              <Trash />
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};

export const MetricForm: FC<ProxyFormProps<typeof metricConfig>> = ({
  editor,
  proxy: { properties, actions },
}) => {
  const { safeAggregationId, aggregationOptions, resultType } =
    useMetricAggregation({
      blockId: ifVaries(properties.blockId, ''),
      aggregationId: ifVaries(properties.aggregation, undefined),
    });

  const aggregationIdProperty = mapProperty(
    properties.aggregation,
    () => safeAggregationId!
  );

  const comparable = resultType?.kind === 'number';
  const hasComparison =
    comparable && !!ifVaries(properties.comparisonBlockId, 'true');

  const {
    safeAggregationId: safeComparisonAggregationId,
    aggregationOptions: comparisonAggregationOptions,
  } = useMetricAggregation({
    blockId: ifVaries(properties.comparisonBlockId, ''),
    aggregationId: ifVaries(properties.comparisonAggregation, undefined),
  });

  const comparisonAggregationIdProperty = mapProperty(
    properties.comparisonAggregation,
    () => safeComparisonAggregationId!
  );

  return (
    <FormWrapper>
      <ProxyStringField
        editor={editor}
        label="Label"
        placeholder="Enter label..."
        property={properties.caption}
        onChange={actions.setCaption}
      />

      <MetricValueField
        editor={editor}
        label="Value"
        blockIdProperty={properties.blockId}
        aggregationIdProperty={aggregationIdProperty}
        aggregationOptions={aggregationOptions}
        onSetBlockId={actions.setBlockId}
        onSetAggregationId={actions.setAggregation}
      />

      {comparable && (
        <>
          <MetricValueField
            editor={editor}
            label="Comparison value"
            showNoneOption
            blockIdProperty={properties.comparisonBlockId}
            aggregationIdProperty={comparisonAggregationIdProperty}
            aggregationOptions={comparisonAggregationOptions}
            onSetBlockId={actions.setComparisonBlockId}
            onSetAggregationId={actions.setComparisonAggregation}
          />

          {hasComparison && (
            <ProxyStringField
              editor={editor}
              label="Comparison description"
              property={properties.comparisonDescription}
              onChange={actions.setComparisonDescription}
              placeholder="Add description..."
            />
          )}
        </>
      )}

      <ProxyDropdownField<NumberFormatting>
        editor={editor}
        label="Number format"
        property={withDefault(properties.formatting, 'automatic')}
        onChange={actions.setFormatting}
        options={['automatic', 'precise', 'financial', 'scientific']}
        labelForValue={capitalize}
      />

      <ProxyColorDropdownField
        editor={editor}
        label="Value color"
        property={properties.color}
        onChange={actions.setColor}
      />

      {hasComparison && (
        <ProxyTrendColorDropdownField
          editor={editor}
          label="Trend color"
          property={properties.trendColor}
          onChange={actions.setTrendColor}
        />
      )}
    </FormWrapper>
  );
};
