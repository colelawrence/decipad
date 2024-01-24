import {
  COLUMN_KINDS,
  ELEMENT_IMAGE,
  PlateComponent,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  isDragAndDropHorizontal,
} from '@decipad/editor-utils';
import { useNodePath } from '@decipad/editor-hooks';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { ImageElement as UIImage } from '../plate-ui';
import { DraggableBlock } from '../block-management/index';
import { useDragAndDropGetAxis, useDragAndDropOnDrop } from '../hooks';

export const Image: PlateComponent = (props) => {
  const { element } = props;
  assertElementType(element, ELEMENT_IMAGE);
  const readOnly = useIsEditorReadOnly();

  const editor = useMyEditorRef();
  const path = useNodePath(element);

  const isHorizontal = isDragAndDropHorizontal(false, editor, path);
  const getAxis = useDragAndDropGetAxis({ isHorizontal });
  const onDrop = useDragAndDropOnDrop({ editor, element, path, isHorizontal });
  return (
    <UIImage
      draggableBlock={DraggableBlock}
      accept={isHorizontal ? COLUMN_KINDS : undefined}
      getAxis={getAxis}
      onDrop={onDrop}
      readOnly={readOnly}
      {...props}
    />
  );
};
