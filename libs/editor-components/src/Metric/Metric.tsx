import {
  AvailableSwatchColor,
  ELEMENT_METRIC,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { Metric as UIMetric } from '@decipad/ui';
import { DraggableBlock } from '../block-management';
import {
  useEditorStylesContext,
  useInsideLayoutContext,
  useIsEditorReadOnly,
} from '@decipad/react-contexts';
import { useComputer, useEditElement } from '@decipad/editor-hooks';

export const Metric: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_METRIC);

  const computer = useComputer();
  const insideLayout = useInsideLayoutContext();
  const readOnly = useIsEditorReadOnly();
  const onEdit = useEditElement(element);

  const mainResultId = element.id;
  const trendResultId = `${element.id}-trend`;

  const mainResult = computer.getBlockIdResult$.use(mainResultId)?.result;

  const trendResult = computer.getBlockIdResult$.use(trendResultId)?.result;

  const { color: defaultColor } = useEditorStylesContext();
  const { color: elementColor = 'auto' } = element;
  const { trendColor: elementTrendColor = 'trend' } = element;

  const color = elementColor === 'auto' ? defaultColor : elementColor;
  const trendColor =
    elementTrendColor === 'auto' ? defaultColor : elementTrendColor;

  // TODO: conditional result still needs to render the slate children.

  return (
    <DraggableBlock
      blockKind="interactive"
      element={element}
      slateAttributes={attributes}
    >
      <UIMetric
        readOnly={readOnly}
        caption={element.caption}
        mainResult={mainResult ?? undefined}
        trendResult={trendResult ?? undefined}
        comparisonDescription={element.comparisonDescription}
        formatting={element.formatting}
        color={color as AvailableSwatchColor}
        trendColor={trendColor as AvailableSwatchColor | 'trend'}
        maxWidth={!insideLayout}
        fullHeight={insideLayout}
        onClickEdit={onEdit}
      >
        {children}
      </UIMetric>
    </DraggableBlock>
  );
};
