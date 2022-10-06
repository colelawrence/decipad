import { ELEMENT_SMART_REF, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { SmartRef as UISmartRef } from '@decipad/ui';
import { useEffect, useState } from 'react';
import { useSelected } from 'slate-react';

export const SmartRef: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_SMART_REF);
  const computer = useComputer();
  const symbolName = computer.getDefinedSymbolInBlock$.use(element.blockId);
  const [lastVariableName, setLastVariableName] = useState(() => symbolName);
  const errorMessage =
    (symbolName == null &&
      `The variable ${
        (lastVariableName != null && `"${lastVariableName}"`) || ''
      } is no longer defined`) ||
    undefined;

  const isSelected = useSelected();

  useEffect(() => {
    if (symbolName) {
      setLastVariableName(symbolName);
    }
  }, [symbolName]);

  return (
    <span {...attributes}>
      <span contentEditable={false}>{'\u2060'}</span>
      <UISmartRef
        defBlockId={element.blockId}
        symbolName={symbolName ?? lastVariableName}
        errorMessage={errorMessage}
        isSelected={isSelected}
      />
      {children}
      <span contentEditable={false}>{'\u2060'}</span>
    </span>
  );
};
