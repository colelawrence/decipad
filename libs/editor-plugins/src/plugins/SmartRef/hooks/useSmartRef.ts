import { isExprRef } from '@decipad/remote-computer';
import {
  useComputer,
  useEditorChange,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-hooks';
import type { MyElement, SmartRefElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import {
  getNextNode,
  getNodeString,
  getPreviousNode,
  insertText,
  isElement,
  isText,
} from '@udecode/plate-common';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { debounceTime, filter } from 'rxjs';
import { ReactEditor, useSelected } from 'slate-react';
import { isSmartRef } from '../utils/isSmartRef';

interface UseSmartRefResult {
  symbolName?: string;
  siblingContent: { hasNext: boolean; hasPrevious: boolean };
  errorMessage?: string;
  isInitialized?: boolean;
  isSelected: boolean;
}

const smartRefDebounceTimeMs = 500;

export const useSmartRef = (element: SmartRefElement): UseSmartRefResult => {
  const siblingContent = useEditorChange(
    (editor) => {
      const previousNode = getPreviousNode<MyElement>(editor, {
        at: ReactEditor.findPath(editor as ReactEditor, element),
      })?.[0];
      const previousStr = isText(previousNode)
        ? getNodeString(previousNode)
        : '';
      const previousElement = getPreviousNode<MyElement>(editor, {
        at: ReactEditor.findPath(editor as ReactEditor, element),
        match: (node) => isElement(node),
      })?.[0];
      const hasPrevious = previousStr.length
        ? /\w$/.test(previousStr)
        : isSmartRef(previousElement);

      const nextNode = getNextNode<MyElement>(editor, {
        at: ReactEditor.findPath(editor as ReactEditor, element),
      })?.[0];
      const nextStr = isText(nextNode) ? getNodeString(nextNode) : '';
      const nextElement = getNextNode<MyElement>(editor, {
        at: ReactEditor.findPath(editor as ReactEditor, element),
        match: (node) => isElement(node),
      })?.[0];
      const hasNext = nextStr.length
        ? /^\w/.test(nextStr)
        : isSmartRef(nextElement);

      return {
        hasPrevious,
        hasNext,
      };
    },
    { debounceTimeMs: smartRefDebounceTimeMs }
  );

  const editor = useMyEditorRef();
  const path = useNodePath(element);
  const setLastSeenVariableName = usePathMutatorCallback<SmartRefElement>(
    editor,
    path,
    'lastSeenVariableName',
    'useSmartRef'
  );

  const [isInitialized, setIsInitialized] = useState(false);

  const mutateLastSeenVariableName = useCallback(
    (newLastSeenVariableName: string) => {
      const currentmutateLastSeenVariableNameText = getNodeString(element);
      if (
        path &&
        currentmutateLastSeenVariableNameText !== newLastSeenVariableName &&
        !isExprRef(newLastSeenVariableName)
      ) {
        insertText(editor, newLastSeenVariableName, { at: path });
      }
      if (element.lastSeenVariableName !== newLastSeenVariableName) {
        setLastSeenVariableName(newLastSeenVariableName);
      }
    },
    [editor, element, path, setLastSeenVariableName]
  );

  const computer = useComputer();
  const symbolName = computer.getSymbolOrTableDotColumn$.use(
    element.blockId,
    element.columnId
  );

  const errorMessage = useMemo(
    () =>
      (symbolName == null &&
        `The variable ${
          (element.lastSeenVariableName != null &&
            `"${element.lastSeenVariableName}"`) ||
          ''
        } is no longer defined`) ||
      undefined,
    [element.lastSeenVariableName, symbolName]
  );

  const isSelected = useSelected();

  useEffect(() => {
    const symbolName$ = computer.getSymbolOrTableDotColumn$
      .observe(element.blockId, element.columnId)
      .pipe(debounceTime(5000))
      .pipe(filter((name) => !!name));

    const sub = symbolName$.subscribe((debouncedSymbolName) => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
      if (
        debouncedSymbolName != null &&
        debouncedSymbolName !== element.lastSeenVariableName &&
        !isExprRef(debouncedSymbolName)
      ) {
        mutateLastSeenVariableName(debouncedSymbolName);
      }
    });

    return () => sub.unsubscribe();
  }, [
    computer,
    element.blockId,
    element.columnId,
    element.lastSeenVariableName,
    mutateLastSeenVariableName,
    isInitialized,
  ]);

  return useMemo(
    () => ({
      symbolName,
      siblingContent,
      errorMessage,
      isInitialized,
      isSelected,
    }),
    [errorMessage, isSelected, siblingContent, symbolName, isInitialized]
  );
};
