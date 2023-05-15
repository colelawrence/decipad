import {
  ELEMENT_SMART_REF,
  MyElement,
  SmartRefElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  useNodePath,
  usePathMutatorCallback,
  useEditorChange,
} from '@decipad/editor-hooks';
import { useComputer } from '@decipad/react-contexts';
import {
  getNextNode,
  getNodeString,
  getPreviousNode,
  insertText,
  isElement,
  isText,
} from '@udecode/plate';
import { debounceTime, filter } from 'rxjs';
import { useCallback, useEffect, useMemo } from 'react';
import { ReactEditor, useSelected } from 'slate-react';

interface UseSmartRefResult {
  symbolName?: string;
  siblingContent: { hasNext: boolean; hasPrevious: boolean };
  errorMessage?: string;
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
        : previousElement?.type === ELEMENT_SMART_REF;

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
        : nextElement?.type === ELEMENT_SMART_REF;

      return {
        hasPrevious,
        hasNext,
      };
    },
    { debounceTimeMs: smartRefDebounceTimeMs }
  );

  const editor = useTEditorRef();
  const path = useNodePath(element);
  const setLastSeenVariableName = usePathMutatorCallback(
    editor,
    path,
    'lastSeenVariableName'
  );
  const mutateLastSeenVariableName = useCallback(
    (newLastSeenVariableName: string) => {
      const currentmutateLastSeenVariableNameText = getNodeString(element);
      if (
        path &&
        currentmutateLastSeenVariableNameText !== newLastSeenVariableName
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
      if (
        debouncedSymbolName != null &&
        debouncedSymbolName !== element.lastSeenVariableName
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
  ]);

  return useMemo(
    () => ({
      symbolName,
      siblingContent,
      errorMessage,
      isSelected,
    }),
    [errorMessage, isSelected, siblingContent, symbolName]
  );
};
