import {
  ELEMENT_SMART_REF,
  MyElement,
  PlateComponent,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useComputer, useEditorChangeState } from '@decipad/react-contexts';
import { SmartRef as UISmartRef } from '@decipad/ui';
import {
  getNextNode,
  getNodeString,
  getPreviousNode,
  isElement,
  isText,
} from '@udecode/plate';
import { useEffect, useState } from 'react';
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

  const computer = useComputer();
  const symbolName = computer.getDefinedSymbolInBlock$.use(element.blockId);
  const [lastVariableName, setLastVariableName] = useState(() => symbolName);
  const errorMessage =
    (symbolName == null &&
      `The variable ${(lastVariableName != null && `"${lastVariableName}"`) || ''
      } is no longer defined`) ||
    undefined;

  const isSelected = useSelected();

  useEffect(() => {
    if (symbolName) {
      setLastVariableName(symbolName);
    }
  }, [symbolName]);

  return (
    <span {...attributes}>
      <span contentEditable={false}>{'\u2060'}</span>
      <UISmartRef
        defBlockId={element.blockId}
        symbolName={symbolName ?? lastVariableName}
        errorMessage={errorMessage}
        isSelected={isSelected}
        hasPreviousContent={siblingContent?.hasPrevious}
        hasNextContent={siblingContent?.hasNext}
      />
      {children}
      <span contentEditable={false}>{'\u2060'}</span>
    </span>
  );
};
