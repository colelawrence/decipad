import {
  ELEMENT_SMART_REF,
  MyElement,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  useNodePath,
  usePathMutatorCallback,
} from '@decipad/editor-utils';
import { useComputer, useEditorChangeState } from '@decipad/react-contexts';
import { SmartRef as UISmartRef } from '@decipad/ui';
import {
  getNextNode,
  getNodeString,
  getPreviousNode,
  isElement,
  isText,
} from '@udecode/plate';
import { debounceTime, filter } from 'rxjs';
import { useEffect } from 'react';
import { ReactEditor, useSelected } from 'slate-react';

export const SmartRef: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_SMART_REF);

  const siblingContent = useEditorChangeState(
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
    { hasNext: false, hasPrevious: false }
  );

  const editor = useTEditorRef();
  const path = useNodePath(element);
  const mutateLastSeen = usePathMutatorCallback(
    editor,
    path,
    'lastSeenVariableName'
  );

  const computer = useComputer();
  const symbolName = computer.getSymbolOrTableDotColumn$.use(
    element.blockId,
    element.columnId
  );

  const errorMessage =
    (symbolName == null &&
      `The variable ${
        (element.lastSeenVariableName != null &&
          `"${element.lastSeenVariableName}"`) ||
        ''
      } is no longer defined`) ||
    undefined;

  const isSelected = useSelected();

  useEffect(() => {
    const symbolName$ = computer.getSymbolOrTableDotColumn$
      .observe(element.blockId, element.columnId)
      .pipe(debounceTime(5000))
      .pipe(filter((name) => !!name));

    const sub = symbolName$.subscribe((debouncedSymbolName) => {
      if (debouncedSymbolName !== element.lastSeenVariableName) {
        mutateLastSeen(debouncedSymbolName);
      }
    });

    return () => sub.unsubscribe();
  }, [
    computer,
    element.blockId,
    element.columnId,
    element.lastSeenVariableName,
    mutateLastSeen,
  ]);

  return (
    <span {...attributes}>
      <UISmartRef
        defBlockId={element.blockId}
        symbolName={symbolName ?? element.lastSeenVariableName}
        errorMessage={errorMessage}
        isSelected={isSelected}
        hasPreviousContent={siblingContent?.hasPrevious}
        hasNextContent={siblingContent?.hasNext}
      />
      {children}
    </span>
  );
};
