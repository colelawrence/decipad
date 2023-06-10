import { ELEMENT_SMART_REF, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { SmartRef as UISmartRef } from '@decipad/ui';
import { useReinstateSmartRefBlockId } from '../hooks/useReinstateSmartRefBlockId';
import { useSmartRef } from '../hooks/useSmartRef';

export const SmartRef: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_SMART_REF);

  const {
    symbolName,
    errorMessage,
    isInitialized,
    isSelected,
    siblingContent,
  } = useSmartRef(element);
  useReinstateSmartRefBlockId(element);

  return (
    <span {...attributes}>
      <UISmartRef
        defBlockId={element.blockId}
        symbolName={symbolName ?? element.lastSeenVariableName}
        errorMessage={errorMessage}
        isInitialized={isInitialized}
        isSelected={isSelected}
        decoration={element.decoration}
        hasPreviousContent={siblingContent?.hasPrevious}
        hasNextContent={siblingContent?.hasNext}
      />
      {children}
    </span>
  );
};
