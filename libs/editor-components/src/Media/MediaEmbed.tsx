import { MediaEmbed as UIMediaEmbed } from '@decipad/ui';
import { ELEMENT_MEDIA_EMBED, PlateComponent } from '@decipad/editor-types';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { assertElementType } from '@decipad/editor-utils';
import { DraggableBlock } from '../block-management/index';
import { BlockErrorBoundary } from '../BlockErrorBoundary';

export const MediaEmbed: PlateComponent = (props) => {
  assertElementType(props.element, ELEMENT_MEDIA_EMBED);
  const readOnly = useIsEditorReadOnly();

  return (
    <BlockErrorBoundary element={props.element}>
      <UIMediaEmbed
        draggableBlock={DraggableBlock}
        readOnly={readOnly}
        pluginKey={ELEMENT_MEDIA_EMBED}
        {...props}
      />
    </BlockErrorBoundary>
  );
};
