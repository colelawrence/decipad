import { useCallback, useMemo } from 'react';
import type { RemoteComputer, AST } from '@decipad/remote-computer';
import {
  simpleValueToString,
  parseSimpleValueUnit,
  parseSimpleValue,
} from '@decipad/remote-computer';
import type { CodeLineV2Element } from '@decipad/editor-types';
import { ELEMENT_SMART_REF, useMyEditorRef } from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { findNodePath, insertText } from '@udecode/plate-common';

export function useSimpleValueInfo(
  computer: RemoteComputer,
  element: CodeLineV2Element,
  sourceCode: string
) {
  const definedVariables = computer.getSetOfNamesDefined$.use();

  const editor = useMyEditorRef();

  // What state are we in? Code line, input, or error?
  const hasSmartRefs = useMemo(
    () =>
      element.children[1].children.some((elm) =>
        isElementOfType(elm, ELEMENT_SMART_REF)
      ),
    [element.children]
  );

  // We want to show a simple value if the result is empty,
  // otherwise it would be considered a calculation.
  const nonEmptySourceCode =
    sourceCode.length === 0
      ? '0'
      : sourceCode.match(/[0-9]/) === null
      ? `0${sourceCode}`
      : sourceCode;

  const simpleValue = useMemo(
    () =>
      hasSmartRefs
        ? undefined
        : parseSimpleValue(nonEmptySourceCode, definedVariables),
    [nonEmptySourceCode, hasSmartRefs, definedVariables]
  );

  const onChangeUnit = useCallback(
    (unit: '%' | AST.Expression | undefined) => {
      if (!simpleValue) return;

      const newCode = simpleValueToString({
        ast: simpleValue.ast,
        unit: unit && parseSimpleValueUnit(unit, definedVariables),
      });
      const pathForChanging = findNodePath(editor, element);

      if (pathForChanging && newCode) {
        insertText(editor, newCode, { at: [...pathForChanging, 1, 0] });
      }
    },
    [simpleValue, definedVariables, element, editor]
  );

  return { editor /* (for tests) */, simpleValue, onChangeUnit };
}
