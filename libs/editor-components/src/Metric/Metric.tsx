import {
  AvailableSwatchColor,
  ELEMENT_METRIC,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { Metric as UIMetric } from '@decipad/ui';
import { DraggableBlock } from '../block-management';
import {
  useInsideLayoutContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import {
  useComputer,
  useEditElement,
  useExpressionResult,
  useMetricAggregation,
} from '@decipad/editor-hooks';
import { getExprRef } from '@decipad/computer';

export const Metric: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_METRIC);
  const {
    id,
    blockId,
    aggregation: aggregationId,
    comparisonBlockId,
    comparisonAggregation: comparisonAggregationId,
    color,
  } = element;

  const computer = useComputer();
  const insideLayout = useInsideLayoutContext();
  const readOnly = useIsEditorReadOnly();
  const onEdit = useEditElement(element);

  const { aggregation } = useMetricAggregation({ blockId, aggregationId });
  const { aggregation: comparisonAggregation } = useMetricAggregation({
    blockId: comparisonBlockId,
    aggregationId: comparisonAggregationId,
  });

  const blockRef = getExprRef(blockId);
  const comparisonBlockRef = getExprRef(comparisonBlockId);

  const expression = aggregation?.expression(blockRef, { sum: '' }) ?? blockRef;
  const comparisonExpresison =
    comparisonAggregation?.expression(comparisonBlockRef, { sum: '' }) ??
    comparisonBlockRef;

  /**
   * Optimization: `computer.getBlockIdResult$` produces a result much faster
   * than `useExpressionResult` does. Use it instead if the main value does not
   * use an aggregation.
   */
  const unaggregatedMainResult =
    computer.getBlockIdResult$.use(blockId)?.result;
  const aggregatedMainResult = useExpressionResult(expression, {
    enabled: !!aggregation,
  });
  const mainResult = aggregation
    ? aggregatedMainResult
    : unaggregatedMainResult;

  const trendResult = useExpressionResult(
    `trend([${comparisonExpresison}, ${expression}])`
  );

  return (
    <div
      {...attributes}
      contentEditable={false}
      id={id}
      css={{ height: '100%' }}
    >
      <DraggableBlock
        blockKind="interactive"
        element={element}
        fullHeight={insideLayout}
      >
        <UIMetric
          readOnly={readOnly}
          caption={element.caption}
          mainResult={mainResult ?? undefined}
          trendResult={trendResult ?? undefined}
          comparisonDescription={element.comparisonDescription}
          formatting={element.formatting}
          color={color as AvailableSwatchColor | undefined}
          fullHeight={insideLayout}
          onClickEdit={onEdit}
        >
          {children}
        </UIMetric>
      </DraggableBlock>
    </div>
  );
};
