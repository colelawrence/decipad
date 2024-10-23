import {
  AvailableSwatchColor,
  ELEMENT_METRIC,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { Metric as UIMetric } from '@decipad/ui';
import { DraggableBlock } from '../block-management';
import { useInsideLayoutContext } from '@decipad/react-contexts';
import { useComputer } from '@decipad/editor-hooks';
import { useEffect, useState } from 'react';
import { ResultType } from '@decipad/computer-interfaces';

export const Metric: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_METRIC);
  const { id, blockId, comparisonBlockId, color } = element;

  const insideLayout = useInsideLayoutContext();

  const computer = useComputer();
  const mainResult = computer.getBlockIdResult$.use(blockId);
  const [trendResult, setTrendResult] = useState<ResultType | null>(null);

  useEffect(() => {
    const observable = computer.expressionResultFromText$(
      `trend([exprRef_${comparisonBlockId}, exprRef_${blockId}])`
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
          mainResult={mainResult}
          trendResult={trendResult ?? undefined}
          color={color as AvailableSwatchColor | undefined}
          fullHeight={insideLayout}
        >
          {children}
        </UIMetric>
      </DraggableBlock>
    </div>
  );
};
