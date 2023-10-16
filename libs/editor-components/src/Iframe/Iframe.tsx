import { ELEMENT_IFRAME, PlateComponent } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { IframeEmbed as UIIframeEmbed } from '@decipad/ui';
import { BlockErrorBoundary } from '../BlockErrorBoundary';
import { DraggableBlock } from '../block-management/index';

export const IframeEmbed: PlateComponent = (props) => {
  assertElementType(props.element, ELEMENT_IFRAME);

  return (
    <BlockErrorBoundary element={props.element}>
      <UIIframeEmbed draggableBlock={DraggableBlock} {...props} />
    </BlockErrorBoundary>
  );
};
