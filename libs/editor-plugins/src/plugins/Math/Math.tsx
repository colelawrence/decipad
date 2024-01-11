import { DraggableBlock } from '@decipad/editor-components';
import {
  ELEMENT_MATH,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import { assertElementType, setSelection } from '@decipad/editor-utils';
import { useComputer, useIsEditorReadOnly } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { MathBlock as UIMathBlock } from '@decipad/ui';
import {
  findNodePath,
  getStartPoint,
  hasNode,
  removeNodes,
} from '@udecode/plate-common';
import { useCallback, useEffect, useState } from 'react';

const Math: PlateComponent = ({ attributes, element, children }) => {
  assertElementType(element, ELEMENT_MATH);

  const editor = useTEditorRef();
  const computer = useComputer();
  const readOnly = useIsEditorReadOnly();

  const sourceId = element.blockId;

  const [math, setMath] = useState('');

  const toast = useToast();

  const hasReference =
    computer.getBlockIdResult$.use(sourceId)?.result?.type.kind !== 'pending';

  const onScrollToRef = useCallback(() => {
    if (sourceId) {
      const el = document.getElementById(sourceId);
      if (el) {
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus();
      } else {
        toast('This formula is not editable in this tab', 'warning');
      }
    }
  }, [sourceId, toast]);

  useEffect(() => {
    if (sourceId) {
      const sub = computer.blockToMathML$(sourceId).subscribe(setMath);
      return () => sub.unsubscribe();
    }
    return undefined;
  }, [sourceId, computer]);

  const onDelete = useCallback(() => {
    const path = findNodePath(editor, element);

    if (path) {
      removeNodes(editor, {
        at: path,
      });
      if (hasNode(editor, path)) {
        const point = getStartPoint(editor, path);
        setSelection(editor, {
          anchor: point,
          focus: point,
        });
      }
    }
  }, [editor, element]);

  return (
    <DraggableBlock
      element={element}
      blockKind="math"
      contentEditable={false}
      {...attributes}
    >
      <UIMathBlock
        readOnly={readOnly}
        onReference={onScrollToRef}
        onDelete={onDelete}
        hasReference={hasReference}
        math={math}
      />
      {children}
    </DraggableBlock>
  );
};

// Default export so we can use React.lazy
export default Math;
