import {
  COLUMN_KINDS,
  ELEMENT_CALLOUT,
  PlateComponent,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  assertElementType,
  isDragAndDropHorizontal,
} from '@decipad/editor-utils';
import { useNodePath, usePathMutatorCallback } from '@decipad/editor-hooks';
import { useEditorStylesContext } from '@decipad/react-contexts';
import { Callout as UICallout } from '@decipad/ui';
import { AvailableSwatchColor, UserIconKey } from 'libs/ui/src/utils';
import { DraggableBlock } from '../block-management';
import { useDragAndDropGetAxis, useDragAndDropOnDrop } from '../hooks';
import { useTurnIntoProps } from '../utils';

export const Callout: PlateComponent = ({ attributes, children, element }) => {
  assertElementType(element, ELEMENT_CALLOUT);

  const editor = useTEditorRef();

  const path = useNodePath(element);
  const saveIcon = usePathMutatorCallback(editor, path, 'icon');
  const saveColor = usePathMutatorCallback(editor, path, 'color');
  const { color: defaultColor } = useEditorStylesContext();

  const turnIntoProps = useTurnIntoProps(element);

  const isHorizontal = isDragAndDropHorizontal(false, editor, path);
  const getAxis = useDragAndDropGetAxis({ isHorizontal });
  const onDrop = useDragAndDropOnDrop({ editor, element, path, isHorizontal });

  return (
    <DraggableBlock
      blockKind="callout"
      element={element}
      accept={isHorizontal ? COLUMN_KINDS : undefined}
      getAxis={getAxis}
      onDrop={onDrop}
      {...turnIntoProps}
      {...attributes}
    >
      <UICallout
        icon={element.icon as UserIconKey}
        color={(element.color ?? defaultColor) as AvailableSwatchColor}
        saveIcon={saveIcon}
        saveColor={saveColor}
      >
        {children}
      </UICallout>
    </DraggableBlock>
  );
};
