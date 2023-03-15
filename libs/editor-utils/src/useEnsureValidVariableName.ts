import {
  MyElement,
  PlainText,
  TableElement,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import {
  ELEMENT_TABLE,
  findNodePath,
  getNodeString,
  insertText,
} from '@udecode/plate';
import { useSelected } from 'slate-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { useBehaviorSubject } from '@decipad/react-utils';
import { timeout } from '@decipad/utils';
import { Computer, identifierRegExpGlobal } from '@decipad/computer';
import { BaseEditor, Editor } from 'slate';
import { isElementOfType } from './isElementOfType';

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
  blockIds: Array<string | undefined> = [],
  defaultVarName = 'Unnamed',
  additionalConflictingNames: string[] = []
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
      const currentVarName = getNodeString(element);

      const varExists =
        computer.variableExists(
          currentVarName,
          blockIds.filter(Boolean) as string[]
        ) || additionalConflictingNames.includes(currentVarName);

      const message = getVariableValidationErrorMessage({
        varName: currentVarName,
        varExists,
      });
      const shouldRename = message != null;

      validationMessage$.next(message);

      // Get next available and valid name
      if (shouldRename && path) {
        const tentativeNewName =
          stripOffInvalidIdentifierCharacters(currentVarName).replace(
            /\d+$/,
            ''
          ) || defaultVarName;
        const newName = computer.getAvailableIdentifier(
          tentativeNewName,
          2,
          false,
          additionalConflictingNames
        );

        insertText(editor, newName, { at: path });
      }
    }, [
      editor,
      element,
      blockIds,
      computer,
      validationMessage$,
      defaultVarName,
      additionalConflictingNames,
    ])
  );

  return useBehaviorSubject(validationMessage$, hideMessageLater);
}

/**
 * like useEnsureValidVariableName but for column names. It checks the column
 * name isn't the same as the table name or any other column name
 */
export function useEnsureValidColumnName(
  element: TableHeaderElement,
  defaultVarName = 'Property'
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
      if (!path) return;

      const table = Editor.above<TableElement>(editor as BaseEditor, {
        match: (n) => isElementOfType(n, ELEMENT_TABLE),
        at: path,
      });
      if (!table) return;

      const [tableCaption, { children: tableHeaders }] = table[0].children;

      const tableName = getNodeString(tableCaption);
      const otherColumnNames = tableHeaders.flatMap((header) =>
        header.id === element.id ? [] : getNodeString(header)
      );

      const currentVarName = getNodeString(element);

      const forbiddenVars = [tableName, ...otherColumnNames];
      const varExists = forbiddenVars.includes(currentVarName);

      const message = getVariableValidationErrorMessage({
        varName: currentVarName,
        varExists,
      });
      const shouldRename = message != null;

      validationMessage$.next(message);

      // Get next available and valid name
      if (shouldRename && path) {
        const tentativeNewName =
          stripOffInvalidIdentifierCharacters(currentVarName).replace(
            /\d+$/,
            ''
          ) || defaultVarName;
        const newName = getNonConflictingVarName(
          forbiddenVars,
          tentativeNewName
        );

        insertText(editor, newName, { at: path });
      }
    }, [editor, element, validationMessage$, defaultVarName])
  );

  return useBehaviorSubject(validationMessage$, hideMessageLater);
}

function getNonConflictingVarName(
  forbiddenVars: string[],
  tentativeName: string
) {
  let i = 1;
  while (forbiddenVars.includes(tentativeName + i)) {
    i += 1;
  }
  return tentativeName + i;
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
