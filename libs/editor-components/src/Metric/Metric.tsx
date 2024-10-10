import {
  AvailableSwatchColor,
  ELEMENT_METRIC,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { Metric as UIMetric } from '@decipad/ui';
import { DraggableBlock } from '../block-management';
import { useInsideLayoutContext } from '@decipad/react-contexts';

export const Metric: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_METRIC);

  const insideLayout = useInsideLayoutContext();

  return (
    <div
      {...attributes}
      contentEditable={false}
      id={element.id}
      css={{ height: '100%' }}
    >
      <DraggableBlock
        blockKind="interactive"
        element={element}
        fullHeight={insideLayout}
      >
        <UIMetric
          color={element.color as AvailableSwatchColor | undefined}
          fullHeight={insideLayout}
        >
          {children}
        </UIMetric>
      </DraggableBlock>
    </div>
  );
};
