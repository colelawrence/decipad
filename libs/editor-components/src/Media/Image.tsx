import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_IMAGE } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { ImageElement as UIImage } from '../plate-ui';
import { DraggableBlock } from '../block-management/index';

export const Image: PlateComponent = (props) => {
  const { element } = props;
  assertElementType(element, ELEMENT_IMAGE);
  const readOnly = useIsEditorReadOnly();

  return (
    <UIImage draggableBlock={DraggableBlock} readOnly={readOnly} {...props} />
  );
};
