import { ELEMENT_SMART_REF, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useComputer } from '@decipad/react-contexts';
import { SmartRef as UISmartRef } from '@decipad/ui';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (symbolName) {
      setLastVariableName(symbolName);
    }
  }, [symbolName]);

  return (
    <span {...attributes} contentEditable={false}>
      <span contentEditable={false}>{'\u2060'}</span>
      <span>{children}</span>
      <UISmartRef
        defBlockId={element.blockId}
        symbolName={symbolName ?? lastVariableName}
        errorMessage={errorMessage}
      />
      <span contentEditable={false}>{'\u2060'}</span>
    </span>
  );
};
