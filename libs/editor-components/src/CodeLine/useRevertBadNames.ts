import { CodeLineV2ElementVarname, useTEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { findNodePath, getNodeString, insertText } from '@udecode/plate';
import { useSelected } from 'slate-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { useBehaviorSubject } from '@decipad/react-utils';
import { timeout } from '@decipad/utils';
import { identifierRegExpGlobal } from '@decipad/computer';

/**
 * Reverts a CodeLineV2's variable name to the last one if the current one is invalid
 *
 * Special cases if previously empty, or newly empty
 */
export function useRevertBadVarNames(
  element: CodeLineV2ElementVarname,
  blockId?: string
): string | undefined {
  const editor = useTEditorRef();
  const computer = useComputer();

  const varName = getNodeString(element);
  const prevVarName = useRef(varName);

  const [validationMessage$] = useState(
    () => new BehaviorSubject<string | undefined>(undefined)
  );

  useOnSlateFocusBlur(
    useCallback(() => {
      prevVarName.current = varName;
    }, [varName]),
    useCallback(() => {
      const path = findNodePath(editor, element);
      const currentVarName = getNodeString(element);

      const varExists = computer.variableExists(currentVarName, blockId);
      const varExisted = computer.variableExists(prevVarName.current, blockId);

      const [shouldRevert, message] = getVariableValidationErrorMessage({
        varName: currentVarName,
        oldVarName: prevVarName.current,
        varExists,
        oldVarExists: varExisted,
      });

      validationMessage$.next(message);

      // Revert varname to previously good one
      if (shouldRevert && path) {
        // Insert text later so as to not mess with cursor
        setTimeout(() => {
          insertText(editor, prevVarName.current, { at: path });
        });
      }
    }, [editor, element, blockId, validationMessage$, computer])
  );

  return useBehaviorSubject(validationMessage$, hideMessageLater);
}

export const variableValidationErrors = {
  varExists: (name: string) => `"${name}" already exists`,
  varEmpty: 'Variables must have names',
  varInvalid: 'Invalid variable name',
};

/** Get whether we should revert to the previous varname, and an error message if any */
export const getVariableValidationErrorMessage = ({
  varName,
  oldVarName,
  varExists,
  oldVarExists,
}: {
  varName: string;
  oldVarName: string;
  varExists: boolean;
  oldVarExists: boolean;
}): [shouldRevert: boolean, message: string | undefined] => {
  const validIdentifierParts =
    varName.match(new RegExp(identifierRegExpGlobal))?.join('') || '';
  if (validIdentifierParts !== varName) {
    return [true, variableValidationErrors.varInvalid];
  }

  if (oldVarName === '') {
    return varExists
      ? [true, variableValidationErrors.varExists(varName)]
      : [false, undefined];
  }
  if (varName === '') {
    return oldVarExists
      ? [false, variableValidationErrors.varEmpty]
      : [true, variableValidationErrors.varEmpty];
  }
  // Already existed; didn't become less valid
  if (oldVarExists) {
    return [
      false,
      varExists ? variableValidationErrors.varExists(varName) : undefined,
    ];
  }

  return varExists
    ? [true, variableValidationErrors.varExists(varName)]
    : [false, undefined];
};

/** When there's a message, hide it later */
const hideMessageLater: (
  obs: Observable<string | undefined>
) => Observable<string | undefined> = (obs) =>
  obs.pipe(
    switchMap(async function* yieldUndefinedLater(message) {
      yield message;

      await timeout(2000);
      // Hide message
      yield undefined;
    })
  );

/** Calls callbacks when slate useSelected() changes */
function useOnSlateFocusBlur(onFocus: () => void, onBlur: () => void) {
  const selected = useSelected();
  const previouslySelected = useRef(selected);

  useEffect(() => {
    if (selected === previouslySelected.current) {
      return;
    }

    previouslySelected.current = selected;

    if (selected === false) {
      onBlur();
    } else {
      onFocus();
    }
  }, [selected, onBlur, onFocus]);
}
