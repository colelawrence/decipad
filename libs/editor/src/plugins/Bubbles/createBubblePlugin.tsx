import { PlatePlugin } from '@udecode/plate';
import { RenderLeafProps } from 'slate-react';
import { BubbleLeaf } from './BubbleLeaf.component';
import { renderBubble } from './renderBubbles';

export const createBubblePlugin = (): PlatePlugin => ({
  renderLeaf: () => (props: RenderLeafProps) => <BubbleLeaf {...props} />,
  decorate: renderBubble,
});
