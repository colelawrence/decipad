import { organisms } from '@decipad/ui';
import { ELEMENT_IMAGE, PlateComponent } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { DraggableBlock } from '../block-management/index';

export const Image: PlateComponent = (props) => {
  const readOnly = useIsEditorReadOnly();

  return (
    <organisms.Image
      draggableBlock={DraggableBlock}
      readOnly={readOnly}
      pluginKey={ELEMENT_IMAGE}
      {...props}
    />
  );
};
