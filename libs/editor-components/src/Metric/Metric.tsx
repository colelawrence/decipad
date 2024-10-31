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
import { useComputer, useEditElement } from '@decipad/editor-hooks';
import { useEffect, useState } from 'react';
import { ResultType } from '@decipad/computer-interfaces';
import { getExprRef } from '@decipad/computer';

export const Metric: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_METRIC);
  const { id, blockId, comparisonBlockId, color } = element;

  const insideLayout = useInsideLayoutContext();
  const readOnly = useIsEditorReadOnly();
  const onEdit = useEditElement(element);

  const computer = useComputer();
  const mainResult = computer.getBlockIdResult$.use(blockId);
  const [trendResult, setTrendResult] = useState<ResultType | null>(null);

  useEffect(() => {
    const observable = computer.expressionResultFromText$(
      `trend([${getExprRef(comparisonBlockId)}, ${getExprRef(blockId)}])`
    );
    const sub = observable.subscribe(setTrendResult);
    return () => sub.unsubscribe();
  }, [computer, blockId, comparisonBlockId]);

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
          mainResult={mainResult}
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
