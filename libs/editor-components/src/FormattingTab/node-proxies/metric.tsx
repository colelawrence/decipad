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
import { FC, useMemo } from 'react';
import { FormWrapper } from '../FormWrapper';
import {
  ProxyColorDropdownField,
  ColorSwatchOrAuto,
  ProxyDropdownField,
  ProxyStringField,
} from '../proxy-fields';
import { ProxyVariableDropdownField } from '../proxy-fields/ProxyVariableDropdownField';
import { useComputer } from '@decipad/editor-hooks';
import { SerializedType } from '@decipad/language-interfaces';
import { css } from '@emotion/react';
import {
  AggregationType,
  availableAggregations,
  getAggregationById,
  getAggregationShortName,
} from '@decipad/language-aggregations';
import { Button } from '@decipad/ui';
import { Trash } from 'libs/ui/src/icons';
import { capitalize } from 'lodash';

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
      color: (node.color ?? 'auto') as ColorSwatchOrAuto,
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
      setColor: (
        node: MetricElement,
        editor: MyEditor,
        color: ColorSwatchOrAuto
      ) =>
        setNodeProperty(
          editor,
          node,
          'color',
          color === 'auto' ? undefined : color
        ),
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

const useResultType = (blockId: string): SerializedType | null => {
  const computer = useComputer();
  const result = computer.getBlockIdResult$.use(blockId);
  if (result?.type !== 'computer-result') return null;
  return result.result.type;
};

interface UseMetricValueOptions {
  blockId: string;
  aggregationId?: string;
}

const useMetricValue = ({ blockId, aggregationId }: UseMetricValueOptions) => {
  const valueType = useResultType(blockId);
  const columnType =
    valueType?.kind === 'column' || valueType?.kind === 'materialized-column'
      ? valueType.cellType
      : null;

  const aggregationOptions = useMemo(
    () => (columnType ? availableAggregations(columnType) : []),
    [columnType]
  );

  const safeAggregationId = useMemo(() => {
    if (aggregationOptions.length === 0) return null;

    // Make sure the selected option is available
    if (aggregationOptions.find(({ id }) => id === aggregationId)) {
      return aggregationId!;
    }

    // Default to first option
    return aggregationOptions[0].id;
  }, [aggregationOptions, aggregationId]);

  const aggregationResultType = useMemo(() => {
    if (!safeAggregationId || !columnType) return null;

    const aggregation = getAggregationById(safeAggregationId);
    if (!aggregation) return null;

    const { getResultType } = aggregation;
    if (!getResultType) return null;

    return getResultType(columnType);
  }, [safeAggregationId, columnType]);

  const resultType = aggregationResultType ?? valueType;

  return {
    safeAggregationId,
    aggregationOptions,
    resultType,
  };
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
  const { safeAggregationId, aggregationOptions, resultType } = useMetricValue({
    blockId: ifVaries(properties.blockId, ''),
    aggregationId: ifVaries(properties.aggregation, undefined),
  });

  const aggregationIdProperty = mapProperty(
    properties.aggregation,
    () => safeAggregationId!
  );

  const comparable = resultType?.kind === 'number';

  const {
    safeAggregationId: safeComparisonAggregationId,
    aggregationOptions: comparisonAggregationOptions,
  } = useMetricValue({
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

          {(properties.comparisonBlockId === 'varies' ||
            properties.comparisonBlockId.value !== '') && (
            <ProxyStringField
              editor={editor}
              label="Comparison description"
              property={properties.comparisonDescription}
              onChange={actions.setComparisonDescription}
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
        label="Metric color"
        property={properties.color}
        onChange={actions.setColor}
      />
    </FormWrapper>
  );
};
