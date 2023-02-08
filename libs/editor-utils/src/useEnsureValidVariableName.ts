import { MyElement, PlainText, useTEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { findNodePath, getNodeString, insertText } from '@udecode/plate';
import { useSelected } from 'slate-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { useBehaviorSubject } from '@decipad/react-utils';
import { timeout } from '@decipad/utils';
import { Computer, identifierRegExpGlobal } from '@decipad/computer';

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

  const [validationMessage$] = useState(
    () => new BehaviorSubject<string | undefined>(undefined)
  );

  useSlateOnBlur(
    computer,
    useCallback(() => {
      const path = findNodePath(editor, element);
      const varName = getNodeString(element);

      const varExists = computer.variableExists(varName, blockId);

      const message = getVariableValidationErrorMessage({ varName, varExists });
      const shouldRename = message != null;

      validationMessage$.next(message);

      // Get next available and valid name
      if (shouldRename && path) {
        const tentativeNewName =
          stripOffInvalidIdentifierCharacters(varName).replace(/\d+$/, '') ||
          defaultVarName;
        const newName = computer.getAvailableIdentifier(tentativeNewName, 2);

        insertText(editor, newName, { at: path });
      }
    }, [editor, element, blockId, validationMessage$, defaultVarName, computer])
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
  if (stripOffInvalidIdentifierCharacters(varName) !== varName) {
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

/** "bad: identifier! " => "badidentifier" */
function stripOffInvalidIdentifierCharacters(varName: string) {
  return varName.match(new RegExp(identifierRegExpGlobal))?.join('') || '';
}

/** Calls callback when slate useSelected() changes to false */
function useSlateOnBlur(computer: Computer, onBlur: () => void) {
  const selected = useSelected();
  const previouslySelected = useRef(selected);

  useEffect(() => {
    if (selected === previouslySelected.current) {
      return;
    }

    previouslySelected.current = selected;

    if (selected === false) {
      // Invoke later to make sure to have Computer's latest state
      setTimeout(onBlur, computer.requestDebounceMs);
    }
  }, [selected, onBlur, computer]);
}
