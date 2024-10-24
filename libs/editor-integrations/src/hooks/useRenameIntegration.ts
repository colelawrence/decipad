import { IntegrationTypes } from '@decipad/editor-types';
import { Runner } from '../runners';
import { useEffect, useMemo, useRef } from 'react';
import { getNodeString } from '@udecode/plate-common';

/**
 * Very ugly.
 *
 * We dont want to call `runner.rename` on mount. Because the computer could be doing stuff and importing our integration.
 *
 * So we need to do some manual diffing and call rename in an effect.
 */
export const useRenameIntegration = (
  runner: Runner,
  element: IntegrationTypes.IntegrationBlock
): void => {
  const previousVarName = useRef(getNodeString(element.children[0]));
  const varName = useMemo(
    () => getNodeString(element.children[0]),
    [element.children]
  );

  useEffect(() => {
    if (previousVarName.current === varName) {
      return;
    }

    previousVarName.current = varName;
    runner.rename(varName);
  }, [runner, varName]);
};
