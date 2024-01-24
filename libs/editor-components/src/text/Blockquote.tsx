import {
  COLUMN_KINDS,
  PlateComponent,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  isDragAndDropHorizontal,
} from '@decipad/editor-utils';
import { useNodePath } from '@decipad/editor-hooks';
import { Blockquote as UIBlockquote } from '@decipad/ui';
import { DraggableBlock } from '../block-management';
import { useDragAndDropGetAxis, useDragAndDropOnDrop } from '../hooks';
import { useTurnIntoProps } from '../utils';

export const Blockquote: PlateComponent = ({
  attributes,
  children,
  element,
}) => {
  assertElementType(element, 'blockquote');
  const turnIntoProps = useTurnIntoProps(element);

  const editor = useMyEditorRef();
  const path = useNodePath(element);
  const isHorizontal = isDragAndDropHorizontal(false, editor, path);
  const getAxis = useDragAndDropGetAxis({ isHorizontal });
  const onDrop = useDragAndDropOnDrop({ editor, element, path, isHorizontal });

  return (
    <DraggableBlock
      blockKind="blockquote"
      element={element}
      getAxis={getAxis}
      accept={isHorizontal ? COLUMN_KINDS : undefined}
      onDrop={onDrop}
      {...turnIntoProps}
      {...attributes}
    >
      <UIBlockquote>{children}</UIBlockquote>
    </DraggableBlock>
  );
};
