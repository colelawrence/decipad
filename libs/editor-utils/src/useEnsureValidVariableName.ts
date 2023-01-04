import { MyElement, PlainText, useTEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { findNodePath, getNodeString, insertText } from '@udecode/plate';
import { useSelected } from 'slate-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { useBehaviorSubject } from '@decipad/react-utils';
import { noop, timeout } from '@decipad/utils';
import { identifierRegExpGlobal } from '@decipad/computer';

/**
 * Makes sure a variable name is not empty or duplicate
 *
 * When that happens a new name is given to it
 *
 * Returns an error message meant to be placed in a tooltip.
 * Error message becomes undefined after a while
 *
 * useSelected() is called within this hook, so it should
 * be called in a slate element component
 */
export function useEnsureValidVariableName(
  element: MyElement & { children: [PlainText] },
  blockId?: string,
  defaultVarName = 'Name'
): string | undefined {
  const editor = useTEditorRef();
  const computer = useComputer();

  const varName = getNodeString(element);

  const [validationMessage$] = useState(
    () => new BehaviorSubject<string | undefined>(undefined)
  );

  useOnSlateFocusBlur(
    noop,
    useCallback(() => {
      const path = findNodePath(editor, element);
      const currentVarName = getNodeString(element);

      const varExists = computer.variableExists(currentVarName, blockId);

      const message = getVariableValidationErrorMessage({
        varName: currentVarName,
        varExists,
      });
      const shouldRename = message != null;

      validationMessage$.next(message);

      // Revert varname to previously good one
      if (shouldRename && path) {
        const newName = computer.getAvailableIdentifier(
          varName.replace(/\d+$/, '') || defaultVarName,
          1
        );

        // Insert text later so as to not mess with cursor
        setTimeout(() => {
          insertText(editor, newName, { at: path });
        });
      }
    }, [
      editor,
      element,
      blockId,
      validationMessage$,
      defaultVarName,
      varName,
      computer,
    ])
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
  varExists,
}: {
  varName: string;
  varExists: boolean;
}): string | undefined => {
  const validIdentifierParts =
    varName.match(new RegExp(identifierRegExpGlobal))?.join('') || '';
  if (validIdentifierParts !== varName) {
    return variableValidationErrors.varInvalid;
  }

  if (varName === '') {
    return variableValidationErrors.varEmpty;
  }

  return varExists ? variableValidationErrors.varExists(varName) : undefined;
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
