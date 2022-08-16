import { organisms } from '@decipad/ui';
import { ELEMENT_MEDIA_EMBED, PlateComponent } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { DraggableBlock } from '../block-management/index';

export const MediaEmbed: PlateComponent = (props) => {
  const readOnly = useIsEditorReadOnly();

  return (
    <organisms.MediaEmbed
      draggableBlock={DraggableBlock}
      readOnly={readOnly}
      pluginKey={ELEMENT_MEDIA_EMBED}
      {...props}
    />
  );
};
