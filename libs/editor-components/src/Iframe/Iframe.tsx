import type { PlateComponent } from '@decipad/editor-types';
import { ELEMENT_IFRAME } from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { IframeEmbed as UIIframeEmbed } from '@decipad/ui';
import { DraggableBlock } from '../block-management/index';

export const IframeEmbed: PlateComponent = ({
  element,
  children,
  attributes,
}) => {
  assertElementType(element, ELEMENT_IFRAME);

  return (
    <DraggableBlock
      blockKind="media"
      element={element}
      slateAttributes={attributes}
    >
      <UIIframeEmbed url={element.url}>{children}</UIIframeEmbed>
    </DraggableBlock>
  );
};
